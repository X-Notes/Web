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
                IRequestHandler<InsertAudiosToNoteCommand, OperationResult<AudiosPlaylistNoteDTO>>,
                IRequestHandler<RemovePlaylistCommand, OperationResult<Unit>>,
                IRequestHandler<RemoveAudioCommand, OperationResult<Unit>>
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

        public async Task<OperationResult<Unit>> Handle(RemovePlaylistCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrdered(note.Id);
                var contentForRemove = contents.FirstOrDefault(x => x.Id == request.ContentId) as AudiosPlaylistNote;
                contents.Remove(contentForRemove);

                var orders = Enumerable.Range(1, contents.Count);
                contents = contents.Zip(orders, (content, order) => {
                    content.Order = order;
                    content.UpdatedAt = DateTimeOffset.Now;
                    return content;
                }).ToList();

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForRemove);
                    await baseNoteContentRepository.UpdateRange(contents);
                    await fileRepository.RemoveRange(contentForRemove.Audios);

                    await transaction.CommitAsync();

                    var pathes = contentForRemove.Audios.SelectMany(x => x.GetNotNullPathes()).ToList();
                    await _mediator.Send(new RemoveFilesByPathesCommand(permissions.User.Id.ToString(), pathes));

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<Unit>(Success: true, Unit.Value);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(RemoveAudioCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var playlist = await this.baseNoteContentRepository.GetContentById<AudiosPlaylistNote>(request.ContentId);
                var audioForRemove = playlist.Audios.First(x => x.Id == request.AudioId);
                playlist.Audios.Remove(audioForRemove);
                playlist.UpdatedAt = DateTimeOffset.Now;

                if (playlist.Audios.Count == 0)
                {
                    var resp = await _mediator.Send(new RemovePlaylistCommand(note.Id, playlist.Id, request.Email));

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    return new OperationResult<Unit>(Success: true, Unit.Value);
                }
                else
                {
                    using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                    try
                    {
                        await baseNoteContentRepository.Update(playlist);
                        await fileRepository.Remove(audioForRemove);

                        await transaction.CommitAsync();

                        var filesForRemove = audioForRemove.GetNotNullPathes().ToList();
                        await _mediator.Send(new RemoveFilesByPathesCommand(permissions.User.Id.ToString(), filesForRemove));

                        historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                        await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                        return new OperationResult<Unit>(Success: true, Unit.Value);
                    }
                    catch (Exception e)
                    {
                        await transaction.RollbackAsync();
                        Console.WriteLine(e);
                    }
                }
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }
    }
}
