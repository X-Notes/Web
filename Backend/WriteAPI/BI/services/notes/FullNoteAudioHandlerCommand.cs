using BI.helpers;
using BI.services.history;
using BI.signalR;
using Common.DatabaseModels.models.NoteContent;
using Common.DTO.notes.FullNoteContent;
using Domain.Commands.files;
using Domain.Commands.noteInner.fileContent.audios;
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
    public class FullNoteAudioHandlerCommand:
                IRequestHandler<InsertAudiosToNoteCommand, OperationResult<AudiosPlaylistNoteDTO>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly FileRepository fileRepository;

        private readonly AudioNoteRepository audioNoteRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        public FullNoteAudioHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            FileRepository fileRepository,
            AudioNoteRepository audioNoteRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.fileRepository = fileRepository;
            this.audioNoteRepository = audioNoteRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
        }

        public async Task<OperationResult<AudiosPlaylistNoteDTO>> Handle(InsertAudiosToNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhere(x => x.NoteId == note.Id);

                var contentForRemove = contents.First(x => x.Id == request.ContentId);

                // FILES LOGIC
                var bytes = await request.Audios.GetFilesBytesAsync();
                var files = await _mediator.Send(new SaveAudiosToNoteCommand(permissions.User.Id, bytes, note.Id));

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForRemove);

                    await fileRepository.AddRange(files);

                    var audioNote = new AudiosPlaylistNote()
                    {
                        Audios = files,
                        Note = note,
                        Order = contentForRemove.Order,
                    };

                    await audioNoteRepository.Add(audioNote);

                    await transaction.CommitAsync();

                    var resultAudios = audioNote.Audios.Select(x => new AudioNoteDTO(x.Name, x.Id, x.PathNonPhotoContent)).ToList();
                    var result = new AudiosPlaylistNoteDTO(audioNote.Id, audioNote.UpdatedAt, audioNote.Name, resultAudios);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<AudiosPlaylistNoteDTO>(Success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    var pathes = files.SelectMany(x => x.GetNotNullPathes()).ToList();
                    await _mediator.Send(new RemoveFilesByPathesCommand(permissions.User.Id.ToString(), pathes));
                }
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return new OperationResult<AudiosPlaylistNoteDTO>(Success: false, null);
        }
    }
}
