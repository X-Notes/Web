using BI.helpers;
using BI.services.history;
using BI.signalR;
using Common.DatabaseModels.models.NoteContent;
using Common.DTO.notes.FullNoteContent;
using Domain.Commands.files;
using Domain.Commands.noteInner.fileContent.videos;
using Domain.Queries.permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;
using WriteContext.Repositories.NoteContent;

namespace BI.services.notes
{
    public class FullNoteVideoHandlerCommand :
        IRequestHandler<InsertVideosToNoteCommand, OperationResult<VideoNoteDTO>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly FileRepository fileRepository;

        private readonly VideoNoteRepository videoNoteRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        public FullNoteVideoHandlerCommand(
            IMediator _mediator, 
            BaseNoteContentRepository baseNoteContentRepository,
            FileRepository fileRepository,
            VideoNoteRepository videoNoteRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.fileRepository = fileRepository;
            this.videoNoteRepository = videoNoteRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
        }

        public async Task<OperationResult<VideoNoteDTO>> Handle(InsertVideosToNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhere(x => x.NoteId == note.Id);

                var contentForRemove = contents.First(x => x.Id == request.ContentId);

                // FILES LOGIC
                var filebyte = await request.Video.GetFilesBytesAsync();
                var file = await _mediator.Send(new SaveVideosToNoteCommand(permissions.User.Id, filebyte, note.Id));

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForRemove);

                    await fileRepository.Add(file);

                    var videoNote = new VideoNote()
                    {
                        AppFileId = file.Id,
                        Name = request.Video.FileName,
                        Note = note,
                        Order = contentForRemove.Order,
                    };

                    await videoNoteRepository.Add(videoNote);

                    await transaction.CommitAsync();

                    var result = new VideoNoteDTO(videoNote.Name, videoNote.AppFileId, file.PathNonPhotoContent, videoNote.Id, videoNote.UpdatedAt);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<VideoNoteDTO>(Success: true, result);
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
            return new OperationResult<VideoNoteDTO>(Success: false, null);
        }
    }
}
