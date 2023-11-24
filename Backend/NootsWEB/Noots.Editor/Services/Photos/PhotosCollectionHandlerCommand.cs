using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets.InnerNote;
using Editor.Commands.Photos;
using Editor.Entities;
using MediatR;
using Microsoft.Extensions.Logging;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.History.Impl;
using Permissions.Queries;
using SignalrUpdater.Impl;

namespace Editor.Services.Photos
{
    public class PhotosCollectionHandlerCommand :
        BaseCollectionHandler,
        IRequestHandler<RemovePhotosFromCollectionCommand, OperationResult<UpdateCollectionContentResult>>,
        IRequestHandler<UpdatePhotosCollectionInfoCommand, OperationResult<UpdateBaseContentResult>>,
        IRequestHandler<TransformToPhotosCollectionCommand, OperationResult<PhotosCollectionNoteDTO>>,
        IRequestHandler<AddPhotosToCollectionCommand, OperationResult<UpdateCollectionContentResult>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        private readonly NoteWSUpdateService noteWSUpdateService;

        private readonly ILogger<PhotosCollectionHandlerCommand> logger;

        public PhotosCollectionHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            CollectionNoteRepository collectionNoteRepository,
            CollectionAppFileRepository collectionNoteAppFileRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService,
            CollectionLinkedService collectionLinkedService,
            NoteWSUpdateService noteWSUpdateService,
            ILogger<PhotosCollectionHandlerCommand> logger) : base(collectionNoteRepository, collectionNoteAppFileRepository, collectionLinkedService)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.noteWSUpdateService = noteWSUpdateService;
            this.logger = logger;
        }

        public async Task<OperationResult<UpdateCollectionContentResult>> Handle(RemovePhotosFromCollectionCommand request, CancellationToken cancellationToken)
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

            await historyCacheService.UpdateNoteAsync(permissions.Note.Id, permissions.Caller.Id);

            if (permissions.IsMultiplyUpdate)
            {
                var updates = new UpdatePhotosCollectionWS(request.ContentId, UpdateOperationEnum.DeleteCollectionItems, resp.collection.UpdatedAt, resp.collection.Version)
                {
                    CollectionItemIds = resp.deleteFileIds
                };
                var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.Note.Id, permissions.GetAllUsers(), request.ConnectionId);
                await appSignalRService.UpdatePhotosCollection(connections, updates);
            }

            var res = new UpdateCollectionContentResult(resp.collection.Id, resp.collection.Version, resp.collection.UpdatedAt, resp.deleteFileIds);
            return new OperationResult<UpdateCollectionContentResult>(success: true, res);
        }


        public async Task<OperationResult<UpdateBaseContentResult>> Handle(UpdatePhotosCollectionInfoCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await collectionNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (collection != null)
                {
                    collection.SetMetaDataPhotos(request.Width, request.Height, request.Count);
                    collection.Name = request.Name;

                    collection.SetDateAndVersion();
                    await baseNoteContentRepository.UpdateAsync(collection);

                    await historyCacheService.UpdateNoteAsync(permissions.Note.Id, permissions.Caller.Id);

                    var updates = new UpdatePhotosCollectionWS(request.ContentId, UpdateOperationEnum.Update, collection.UpdatedAt, collection.Version)
                    {
                        Name = request.Name,
                        CountInRow = request.Count,
                        Height = request.Height,
                        Width = request.Width
                    };

                    if (permissions.IsMultiplyUpdate)
                    {
                        var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.Note.Id, permissions.GetAllUsers(), request.ConnectionId);
                        await appSignalRService.UpdatePhotosCollection(connections, updates);
                    }

                    var res = new UpdateBaseContentResult(collection.Id, collection.Version, collection.UpdatedAt);
                    return new OperationResult<UpdateBaseContentResult>(success: true, res);
                }

                return new OperationResult<UpdateBaseContentResult>().SetNotFound();
            }

            return new OperationResult<UpdateBaseContentResult>().SetNoPermissions();
        }

        public async Task<OperationResult<PhotosCollectionNoteDTO>> Handle(TransformToPhotosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var contentForRemove = await baseNoteContentRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (contentForRemove == null)
                {
                    return new OperationResult<PhotosCollectionNoteDTO>().SetNotFound();
                }

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForRemove);

                    var collection = new CollectionNote(FileTypeEnum.Photo)
                    {
                        NoteId = request.NoteId,
                        Order = contentForRemove.Order,
                    };

                    await collectionNoteRepository.AddAsync(collection);

                    await transaction.CommitAsync();

                    var metadata = collection.GetMetadata();
                    var result = new PhotosCollectionNoteDTO(null, collection.Name, metadata?.Width, metadata?.Height, collection.Id, collection.Order, metadata?.CountInRow, collection.UpdatedAt, 1);

                    await historyCacheService.UpdateNoteAsync(permissions.Note.Id, permissions.Caller.Id);

                    var updates = new UpdatePhotosCollectionWS(request.ContentId, UpdateOperationEnum.Transform, collection.UpdatedAt, collection.Version)
                    {
                        CollectionItemIds = new List<Guid> { contentForRemove.Id },
                        Collection = result
                    };

                    if (permissions.IsMultiplyUpdate)
                    {
                        var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.Note.Id, permissions.GetAllUsers(), request.ConnectionId);
                        await appSignalRService.UpdatePhotosCollection(connections, updates);
                    }

                    return new OperationResult<PhotosCollectionNoteDTO>(success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    logger.LogError(e.ToString());
                }
            }

            return new OperationResult<PhotosCollectionNoteDTO>().SetNoPermissions();
        }


        public async Task<OperationResult<UpdateCollectionContentResult>> Handle(AddPhotosToCollectionCommand request, CancellationToken cancellationToken)
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

            await collectionNoteRepository.UpdateAsync(resp.collection);

            await historyCacheService.UpdateNoteAsync(permissions.Note.Id, permissions.Caller.Id);

            var updates = new UpdatePhotosCollectionWS(request.ContentId, UpdateOperationEnum.AddCollectionItems, resp.collection.UpdatedAt, resp.collection.Version)
            {
                CollectionItemIds = resp.deleteFileIds
            };

            if (permissions.IsMultiplyUpdate)
            {
                var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.Note.Id, permissions.GetAllUsers(), request.ConnectionId);
                await appSignalRService.UpdatePhotosCollection(connections, updates);
            }

            var res = new UpdateCollectionContentResult(resp.collection.Id, resp.collection.Version, resp.collection.UpdatedAt, resp.deleteFileIds);
            return new OperationResult<UpdateCollectionContentResult>(success: true, res);
        }
    }
}
