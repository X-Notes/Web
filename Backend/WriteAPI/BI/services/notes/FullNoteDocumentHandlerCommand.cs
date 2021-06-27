using BI.helpers;
using BI.Mapping;
using BI.services.history;
using BI.signalR;
using Common.DatabaseModels.models.NoteContent;
using Common.DatabaseModels.models.NoteContent.ContentParts;
using Common.DTO.notes.FullNoteContent;
using Domain.Commands.files;
using Domain.Commands.noteInner;
using Domain.Commands.noteInner.fileContent.albums;
using Domain.Commands.noteInner.fileContent.audios;
using Domain.Commands.noteInner.fileContent.documents;
using Domain.Commands.noteInner.fileContent.videos;
using Domain.Queries.permissions;
using FacadeML;
using MediatR;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;

namespace BI.services.notes
{
    public class FullNoteDocumentHandlerCommand :       
        // FILES
        IRequestHandler<InsertDocumentsToNoteCommand, OperationResult<DocumentNoteDTO>>
    {

        private readonly IMediator _mediator;

        private readonly DocumentNoteRepository documentNoteRepository;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly FileRepository fileRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        public FullNoteDocumentHandlerCommand(
                                        IMediator _mediator,
                                        BaseNoteContentRepository baseNoteContentRepository,
                                        FileRepository fileRepository,
                                        DocumentNoteRepository documentNoteRepository,
                                        HistoryCacheService historyCacheService,
                                        AppSignalRService appSignalRService)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.fileRepository = fileRepository;
            this.documentNoteRepository = documentNoteRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
        }


        public async Task<OperationResult<DocumentNoteDTO>> Handle(InsertDocumentsToNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhere(x => x.NoteId == note.Id);

                var contentForRemove = contents.First(x => x.Id == request.ContentId);

                // FILES LOGIC
                var filebyte = await request.File.GetFilesBytesAsync();
                var file = await _mediator.Send(new SaveDocumentsToNoteCommand(permissions.User.Id, filebyte, note.Id));

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForRemove);

                    await fileRepository.Add(file);

                    var documentNote = new DocumentNote()
                    {
                        AppFileId = file.Id,
                        Name = request.File.FileName,
                        Note = note,
                        Order = contentForRemove.Order,
                    };

                    await documentNoteRepository.Add(documentNote);

                    await transaction.CommitAsync();

                    var result = new DocumentNoteDTO(documentNote.Name, file.PathNonPhotoContent, documentNote.AppFileId, documentNote.Id, documentNote.UpdatedAt);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<DocumentNoteDTO>(Success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    var pathes = new List<string> { file.PathNonPhotoContent };
                    await _mediator.Send(new RemoveFilesByPathesCommand(permissions.User.Id.ToString(), pathes));
                }
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return new OperationResult<DocumentNoteDTO>(Success: false, null);
        }
    }
}
