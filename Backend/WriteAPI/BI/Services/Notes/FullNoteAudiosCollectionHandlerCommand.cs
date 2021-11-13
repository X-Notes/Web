using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Services.History;
using BI.SignalR;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.Interfaces.Note;
using Domain.Commands.Files;
using Domain.Commands.NoteInner.FileContent.Audios;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public class FullNoteAudiosCollectionHandlerCommand : FullNoteBaseCollection,
                IRequestHandler<UnlinkAudiosCollectionCommand, OperationResult<Unit>>,
                IRequestHandler<RemoveAudioFromCollectionCommand, OperationResult<Unit>>,
                IRequestHandler<ChangeNameAudiosCollectionCommand, OperationResult<Unit>>,
                IRequestHandler<UploadAudiosToCollectionCommand, OperationResult<List<AudioNoteDTO>>>,
                IRequestHandler<TransformToAudiosCollectionCommand, OperationResult<AudiosCollectionNoteDTO>>,
                IRequestHandler<UpdateAudiosContentsCommand, OperationResult<Unit>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly AudiosCollectionNoteRepository audioNoteRepository;

        private readonly AudioNoteAppFileRepository audioNoteAppFileRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        public FullNoteAudiosCollectionHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            FileRepository fileRepository,
            AudiosCollectionNoteRepository audioNoteRepository,
            AudioNoteAppFileRepository audioNoteAppFileRepository,
            AppFileUploadInfoRepository appFileUploadInfoRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService) : base(appFileUploadInfoRepository, fileRepository)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.audioNoteRepository = audioNoteRepository;
            this.audioNoteAppFileRepository = audioNoteAppFileRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
        }


        public async Task<OperationResult<Unit>> Handle(UnlinkAudiosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var audios = await audioNoteAppFileRepository.GetWhereAsync(x => x.AudiosCollectionNoteId == request.ContentId);

                if (audios.Any())
                {
                    var ids = audios.Select(x => x.AppFileId).ToArray();
                    await MarkAsUnlinked(ids);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(RemoveAudioFromCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var audiosCollection = await audioNoteRepository.GetOneIncludeAudioNoteAppFiles(request.ContentId);

                if(audiosCollection != null)
                {
                    audiosCollection.AudioNoteAppFiles = audiosCollection.AudioNoteAppFiles.Where(x => x.AppFileId != request.AudioId).ToList();
                    audiosCollection.UpdatedAt = DateTimeOffset.Now;

                    await audioNoteRepository.UpdateAsync(audiosCollection);
                    await MarkAsUnlinked(request.AudioId);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(ChangeNameAudiosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var audiosCollection = await audioNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if(audiosCollection != null)
                {
                    audiosCollection.Name = request.Name;
                    audiosCollection.UpdatedAt = DateTimeOffset.Now;

                    await audioNoteRepository.UpdateAsync(audiosCollection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<List<AudioNoteDTO>>> Handle(UploadAudiosToCollectionCommand request, CancellationToken cancellationToken)
        {
            // TODO
            // 1. Handler when user upload many
            // 2. User Memory

            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                // PERMISSION MEMORY
                var uploadPermission = await _mediator.Send(new GetPermissionUploadFileQuery(request.Audios.Sum(x => x.Length), permissions.Author.Id));
                if (uploadPermission == PermissionUploadFileEnum.NoCanUpload)
                {
                    return new OperationResult<List<AudioNoteDTO>>().SetNoEnougnMemory();
                }

                // FILE LOGIC
                var filebytes = await request.Audios.GetFilesBytesAsync();
                var dbFiles = await _mediator.Send(new SaveAudiosToNoteCommand(permissions.Author.Id, filebytes, note.Id));

                if (cancellationToken.IsCancellationRequested)
                {
                    var pathes = dbFiles.SelectMany(x => x.GetNotNullPathes()).ToList();
                    await _mediator.Send(new RemoveFilesFromStorageCommand(pathes, permissions.Author.Id.ToString()));
                    return new OperationResult<List<AudioNoteDTO>>().SetRequestCancelled();
                }

                // UPDATING
                var audiosCollection = await audioNoteRepository.GetOneIncludeAudios(request.ContentId);

                if (audiosCollection == null)
                {
                    return new OperationResult<List<AudioNoteDTO>>().SetNotFound();
                }

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    audiosCollection.Audios.AddRange(dbFiles);
                    audiosCollection.UpdatedAt = DateTimeOffset.Now;

                    await audioNoteRepository.UpdateAsync(audiosCollection);

                    await MarkAsLinked(dbFiles);

                    await transaction.CommitAsync();

                    var audios = dbFiles.Select(x => new AudioNoteDTO(x.Name, x.Id, x.PathNonPhotoContent, x.UserId)).ToList();

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<List<AudioNoteDTO>>(success: true, audios);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), dbFiles));
                }
            }

            return new OperationResult<List<AudioNoteDTO>>().SetNoPermissions();
        }

        public async Task<OperationResult<AudiosCollectionNoteDTO>> Handle(TransformToAudiosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var contentForRemove = await baseNoteContentRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if(contentForRemove == null)
                {
                    return new OperationResult<AudiosCollectionNoteDTO>().SetNotFound();
                }

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForRemove);

                    var audioNote = new AudiosCollectionNote()
                    {
                        NoteId = request.NoteId,
                        Order = contentForRemove.Order,
                    };

                    await audioNoteRepository.AddAsync(audioNote);

                    await transaction.CommitAsync();

                    var result = new AudiosCollectionNoteDTO(audioNote.Id, audioNote.Order, audioNote.UpdatedAt, audioNote.Name, null);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<AudiosCollectionNoteDTO>(success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
            }

            return new OperationResult<AudiosCollectionNoteDTO>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(UpdateAudiosContentsCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                if (request.Audios.Count == 1)
                {
                    await UpdateOne(request.Audios.First());
                }
                else
                {
                    await UpdateMany(request.Audios);
                }

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                // TODO DEADLOCK
                return new OperationResult<Unit>(success: true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        private async Task UpdateMany(List<AudiosCollectionNoteDTO> entities)
        {
            foreach (var entity in entities)
            {
                await UpdateOne(entity);
            }
        }

        private async Task UpdateOne(AudiosCollectionNoteDTO entity)
        {
            var entityForUpdate = await audioNoteRepository.GetOneIncludeAudioNoteAppFiles(entity.Id);
            if (entityForUpdate != null)
            {
                entityForUpdate.UpdatedAt = DateTimeOffset.Now;
                entityForUpdate.Name = entity.Name;

                var databaseFileIds = entityForUpdate.AudioNoteAppFiles.Select(x => x.AppFileId);
                var entityFileIds = entity.Audios.Select(x => x.FileId);

                var idsForDelete = databaseFileIds.Except(entityFileIds);
                var idsForAdd = entityFileIds.Except(databaseFileIds);

                if (idsForDelete.Any() || idsForAdd.Any())
                {
                    entityForUpdate.AudioNoteAppFiles = entity.Audios.Select(x => 
                        new AudioNoteAppFile { AppFileId = x.FileId, AudiosCollectionNoteId = entityForUpdate.Id }).ToList();
                }

                if (idsForDelete.Any())
                {
                    await MarkAsUnlinked(idsForDelete.ToArray());
                }

                if (idsForAdd.Any())
                {
                    await MarkAsLinked(idsForAdd.ToArray());
                }

                await audioNoteRepository.UpdateAsync(entityForUpdate);
            }
        }
    }
}
