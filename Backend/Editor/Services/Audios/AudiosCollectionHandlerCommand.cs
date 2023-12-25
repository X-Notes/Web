using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets.InnerNote;
using DatabaseContext.Repositories.NoteContent;
using Editor.Commands.Audios;
using Editor.Entities;
using History.Impl;
using MediatR;
using Microsoft.Extensions.Logging;
using Permissions.Queries;
using SignalrUpdater.Impl;

namespace Editor.Services.Audios
{
    public class AudiosCollectionHandlerCommand :
                BaseCollectionHandler,
                IRequestHandler<RemoveAudiosFromCollectionCommand, OperationResult<UpdateCollectionContentResult>>,
                IRequestHandler<UpdateAudiosCollectionInfoCommand, OperationResult<UpdateBaseContentResult>>,
                IRequestHandler<TransformToAudiosCollectionCommand, OperationResult<AudiosCollectionNoteDTO>>,
                IRequestHandler<AddAudiosToCollectionCommand, OperationResult<UpdateCollectionContentResult>>
    {

        private readonly IMediator _mediator;
        private readonly HistoryCacheService historyCacheService;
        private readonly AppSignalRService appSignalRService;
        private readonly NoteWSUpdateService noteWSUpdateService;
        private readonly ILogger<AudiosCollectionHandlerCommand> logger;
        private readonly NotesMultipleUpdateService notesMultipleUpdateService;

        public AudiosCollectionHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            CollectionAppFileRepository collectionNoteAppFileRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService,
            CollectionLinkedService collectionLinkedService,
            NoteWSUpdateService noteWSUpdateService,
            ILogger<AudiosCollectionHandlerCommand> logger,
            NotesMultipleUpdateService notesMultipleUpdateService) : base(baseNoteContentRepository, collectionNoteAppFileRepository, collectionLinkedService)
        {
            this._mediator = _mediator;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.noteWSUpdateService = noteWSUpdateService;
            this.logger = logger;
            this.notesMultipleUpdateService = notesMultipleUpdateService;
        }

        public async Task<OperationResult<UpdateCollectionContentResult>> Handle(RemoveAudiosFromCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (!permissions.CanWrite)
            {
                return new OperationResult<UpdateCollectionContentResult>().SetNoPermissions();
            }

            var resp = await RemoveFilesFromCollectionAsync(request.ContentId, request.FileIds);
            if (resp.collection == null)
            {
                return new OperationResult<UpdateCollectionContentResult>().SetNotFound();
            }

            await historyCacheService.UpdateNoteAsync(permissions.NoteId, permissions.CallerId);

            var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);

            if (noteStatus.IsShared)
            {
                var updates = new UpdateAudiosCollectionWS(request.ContentId, UpdateOperationEnum.DeleteCollectionItems, resp.collection.UpdatedAt, resp.collection.Version)
                {
                    CollectionItemIds = resp.deleteFileIds
                };
                var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
                await appSignalRService.UpdateAudiosCollection(connections, updates);
            }

            var res = new UpdateCollectionContentResult(resp.collection.Id, resp.collection.Version, resp.collection.UpdatedAt, resp.deleteFileIds);
            return new OperationResult<UpdateCollectionContentResult>(success: true, res);
        }

        public async Task<OperationResult<UpdateBaseContentResult>> Handle(UpdateAudiosCollectionInfoCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var audiosCollection = await base.baseNoteContentRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (audiosCollection != null)
                {
                    var metadata = audiosCollection.GetCollectionMetadata();
                    metadata.Name = request.Name;
                    audiosCollection.UpdateCollectionMetadata(metadata);

                    audiosCollection.SetDateAndVersion();

                    await base.baseNoteContentRepository.UpdateAsync(audiosCollection);

                    await historyCacheService.UpdateNoteAsync(permissions.NoteId, permissions.CallerId);

                    var updates = new UpdateAudiosCollectionWS(request.ContentId, UpdateOperationEnum.Update, audiosCollection.UpdatedAt, audiosCollection.Version)
                    {
                        Name = request.Name,
                    };

                    var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);

                    if (noteStatus.IsShared)
                    {
                        var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
                        await appSignalRService.UpdateAudiosCollection(connections, updates);
                    }

                    var res = new UpdateBaseContentResult(audiosCollection.Id, audiosCollection.Version, audiosCollection.UpdatedAt);
                    return new OperationResult<UpdateBaseContentResult>(success: true, res);
                }

                return new OperationResult<UpdateBaseContentResult>().SetNotFound();
            }

            return new OperationResult<UpdateBaseContentResult>().SetNoPermissions();
        }


        public async Task<OperationResult<AudiosCollectionNoteDTO>> Handle(TransformToAudiosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var contentForRemove = await baseNoteContentRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (contentForRemove == null)
                {
                    return new OperationResult<AudiosCollectionNoteDTO>().SetNotFound();
                }

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForRemove);

                    var collection = BaseNoteContent.CreateCollectionNote(FileTypeEnum.Audio);
                    collection.NoteId = request.NoteId;
                    collection.Order = contentForRemove.Order;

                    await baseNoteContentRepository.AddAsync(collection);

                    await transaction.CommitAsync();

                    var metadata = collection.GetCollectionMetadata();
                    var result = new AudiosCollectionNoteDTO(collection.Id, collection.Order, collection.UpdatedAt,
                        metadata?.Name, null, 1);

                    await historyCacheService.UpdateNoteAsync(permissions.NoteId, permissions.CallerId);

                    var updates = new UpdateAudiosCollectionWS(request.ContentId, UpdateOperationEnum.Transform, collection.UpdatedAt, collection.Version)
                    {
                        CollectionItemIds = new List<Guid> { contentForRemove.Id },
                        Collection = result
                    };

                    var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);

                    if (noteStatus.IsShared)
                    {
                        var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
                        await appSignalRService.UpdateAudiosCollection(connections, updates);
                    }

                    return new OperationResult<AudiosCollectionNoteDTO>(success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    logger.LogError(e.ToString());
                }
            }

            return new OperationResult<AudiosCollectionNoteDTO>().SetNoPermissions();
        }

        public async Task<OperationResult<UpdateCollectionContentResult>> Handle(AddAudiosToCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (!permissions.CanWrite)
            {
                return new OperationResult<UpdateCollectionContentResult>().SetNoPermissions();
            }

            var resp = await AddFilesToCollectionAsync(request.ContentId, request.FileIds);
            if (resp.collection == null)
            {
                return new OperationResult<UpdateCollectionContentResult>().SetNotFound();
            }

            await historyCacheService.UpdateNoteAsync(permissions.NoteId, permissions.CallerId);

            var updates = new UpdateAudiosCollectionWS(request.ContentId, UpdateOperationEnum.AddCollectionItems, resp.collection.UpdatedAt, resp.collection.Version)
            {
                CollectionItemIds = resp.deleteFileIds
            };

            var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);

            if (noteStatus.IsShared)
            {
                var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
                await appSignalRService.UpdateAudiosCollection(connections, updates);
            }

            var res = new UpdateCollectionContentResult(resp.collection.Id, resp.collection.Version, resp.collection.UpdatedAt, resp.deleteFileIds);
            return new OperationResult<UpdateCollectionContentResult>(success: true, res);
        }
    }
}