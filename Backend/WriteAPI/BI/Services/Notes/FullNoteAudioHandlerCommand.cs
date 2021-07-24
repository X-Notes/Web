using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Services.History;
using BI.SignalR;
using Common.DatabaseModels.Models.NoteContent;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.Files;
using Domain.Commands.NoteInner.FileContent.Audios;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public class FullNoteAudioHandlerCommand :
                IRequestHandler<InsertAudiosToNoteCommand, OperationResult<AudiosPlaylistNoteDTO>>,
                IRequestHandler<RemovePlaylistCommand, OperationResult<Unit>>,
                IRequestHandler<RemoveAudioCommand, OperationResult<Unit>>,
                IRequestHandler<ChangeNamePlaylistCommand, OperationResult<Unit>>,
                IRequestHandler<UploadAudiosToPlaylistCommand, OperationResult<List<AudioNoteDTO>>>
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
                var contents = await baseNoteContentRepository.GetWhereAsync(x => x.NoteId == note.Id);

                var contentForRemove = contents.First(x => x.Id == request.ContentId);

                // FILES LOGIC
                var bytes = await request.Audios.GetFilesBytesAsync();
                var files = await _mediator.Send(new SaveAudiosToNoteCommand(permissions.Author.Id, bytes, note.Id));

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForRemove);

                    await fileRepository.AddRangeAsync(files);

                    var audioNote = new AudiosPlaylistNote()
                    {
                        Audios = files,
                        Note = note,
                        Order = contentForRemove.Order,
                    };

                    await audioNoteRepository.AddAsync(audioNote);

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
                    await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), files));
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
                contents = contents.Zip(orders, (content, order) =>
                {
                    content.Order = order;
                    content.UpdatedAt = DateTimeOffset.Now;
                    return content;
                }).ToList();

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForRemove);
                    await baseNoteContentRepository.UpdateRangeAsync(contents);

                    await transaction.CommitAsync();

                    await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), contentForRemove.Audios));

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
                var playlist = await baseNoteContentRepository.GetContentById<AudiosPlaylistNote>(request.ContentId);
                var audioForRemove = playlist.Audios.First(x => x.Id == request.AudioId);
                playlist.Audios.Remove(audioForRemove);
                playlist.UpdatedAt = DateTimeOffset.Now;

                if (playlist.Audios.Count == 0)
                {
                    var resp = await _mediator.Send(new RemovePlaylistCommand(note.Id, playlist.Id, request.Email));
                }
                else
                {
                    await baseNoteContentRepository.UpdateAsync(playlist);
                }

                await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), audioForRemove));
                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);
                return new OperationResult<Unit>(Success: true, Unit.Value);
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(ChangeNamePlaylistCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var playlist = await baseNoteContentRepository.GetContentById<AudiosPlaylistNote>(request.ContentId);

                playlist.Name = request.Name;
                playlist.UpdatedAt = DateTimeOffset.Now;

                await baseNoteContentRepository.UpdateAsync(playlist);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<Unit>(Success: true, Unit.Value);
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }

        public async Task<OperationResult<List<AudioNoteDTO>>> Handle(UploadAudiosToPlaylistCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var playlist = await baseNoteContentRepository.GetContentById<AudiosPlaylistNote>(request.ContentId);

                var filebytes = await request.Audios.GetFilesBytesAsync();
                var dbFiles = await _mediator.Send(new SaveAudiosToNoteCommand(permissions.Author.Id, filebytes, note.Id));

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await fileRepository.AddRangeAsync(dbFiles);

                    playlist.Audios.AddRange(dbFiles);
                    playlist.UpdatedAt = DateTimeOffset.Now;

                    await audioNoteRepository.UpdateAsync(playlist);

                    await transaction.CommitAsync();

                    var audios = dbFiles.Select(x => new AudioNoteDTO(x.Name, x.Id, x.PathNonPhotoContent)).ToList();

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<List<AudioNoteDTO>>(Success: true, audios);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), dbFiles));
                }
            }

            return new OperationResult<List<AudioNoteDTO>>(Success: false, null);
        }
    }
}
