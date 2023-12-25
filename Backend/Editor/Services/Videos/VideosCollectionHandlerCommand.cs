using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets.InnerNote;
using DatabaseContext.Repositories.NoteContent;
using Editor.Commands.Videos;
using Editor.Entities;
using History.Impl;
using MediatR;
using Microsoft.Extensions.Logging;
using Permissions.Queries;
using SignalrUpdater.Impl;

namespace Editor.Services.Videos
{
    public class VideosCollectionHandlerCommand :
        BaseCollectionHandler,
        IRequestHandler<RemoveVideosFromCollectionCommand, OperationResult<UpdateCollectionContentResult>>,
        IRequestHandler<TransformToVideosCollectionCommand, OperationResult<VideosCollectionNoteDTO>>,
        IRequestHandler<AddVideosToCollectionCommand, OperationResult<UpdateCollectionContentResult>>,
        IRequestHandler<UpdateVideosCollectionInfoCommand, OperationResult<UpdateBaseContentResult>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        private readonly NoteWSUpdateService noteWSUpdateService;

        private readonly ILogger<VideosCollectionHandlerCommand> logger;

        private readonly NotesMultipleUpdateService notesMultipleUpdateService;

        public VideosCollectionHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            CollectionAppFileRepository collectionNoteAppFileRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService,
            CollectionLinkedService collectionLinkedService,
            NoteWSUpdateService noteWSUpdateService,
            ILogger<VideosCollectionHandlerCommand> logger,
            NotesMultipleUpdateService notesMultipleUpdateService) : base(baseNoteContentRepository, collectionNoteAppFileRepository, collectionLinkedService)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.noteWSUpdateService = noteWSUpdateService;
            this.logger = logger;
            this.notesMultipleUpdateService = notesMultipleUpdateService;
        }

        public async Task<OperationResult<UpdateCollectionContentResult>> Handle(RemoveVideosFromCollectionCommand request, CancellationToken cancellationToken)
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
                var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.DeleteCollectionItems, resp.collection.UpdatedAt, resp.collection.Version)
                {
                    CollectionItemIds = resp.deleteFileIds
                };
                var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
                await appSignalRService.UpdateVideosCollection(connections, updates);
            }

            var res = new UpdateCollectionContentResult(resp.collection.Id, resp.collection.Version, resp.collection.UpdatedAt, resp.deleteFileIds);
            return new OperationResult<UpdateCollectionContentResult>(success: true, res);
        }

        public async Task<OperationResult<VideosCollectionNoteDTO>> Handle(TransformToVideosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var contentForRemove = await baseNoteContentRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (contentForRemove == null)
                {
                    return new OperationResult<VideosCollectionNoteDTO>().SetNotFound();
                }

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForRemove);

                    var collection = BaseNoteContent.CreateCollectionNote(FileTypeEnum.Video);
                    collection.NoteId = request.NoteId;
                    collection.Order = contentForRemove.Order;

                    await base.baseNoteContentRepository.AddAsync(collection);

                    await transaction.CommitAsync(cancellationToken);

                    var metadata = collection.GetCollectionMetadata();
                    var result = new VideosCollectionNoteDTO(collection.Id, collection.Order, collection.UpdatedAt, metadata?.Name, null, 1);

                    await historyCacheService.UpdateNoteAsync(permissions.NoteId, permissions.CallerId);

                    var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.Transform, collection.UpdatedAt, collection.Version)
                    {
                        CollectionItemIds = new List<Guid> { contentForRemove.Id },
                        Collection = result
                    };

                    var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);

                    if (noteStatus.IsShared)
                    {
                        var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
                        await appSignalRService.UpdateVideosCollection(connections, updates);
                    }

                    return new OperationResult<VideosCollectionNoteDTO>(success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    logger.LogError(e.ToString());
                }
            }

            return new OperationResult<VideosCollectionNoteDTO>().SetNoPermissions();
        }


        public async Task<OperationResult<UpdateBaseContentResult>> Handle(UpdateVideosCollectionInfoCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var videosCollection = await base.baseNoteContentRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (videosCollection != null)
                {
                    var metadata = videosCollection.GetCollectionMetadata();
                    metadata.Name = request.Name;
                    videosCollection.UpdateCollectionMetadata(metadata);

                    videosCollection.SetDateAndVersion();

                    await base.baseNoteContentRepository.UpdateAsync(videosCollection);

                    await historyCacheService.UpdateNoteAsync(permissions.NoteId, permissions.CallerId);

                    var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.Update, videosCollection.UpdatedAt, videosCollection.Version)
                    {
                        Name = request.Name,
                    };

                    var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);

                    if (noteStatus.IsShared)
                    {
                        var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
                        await appSignalRService.UpdateVideosCollection(connections, updates);
                    }

                    var res = new UpdateBaseContentResult(videosCollection.Id, videosCollection.Version, videosCollection.UpdatedAt);
                    return new OperationResult<UpdateBaseContentResult>(success: true, res);
                }

                return new OperationResult<UpdateBaseContentResult>().SetNotFound();
            }

            return new OperationResult<UpdateBaseContentResult>().SetNoPermissions();
        }

        public async Task<OperationResult<UpdateCollectionContentResult>> Handle(AddVideosToCollectionCommand request, CancellationToken cancellationToken)
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

            var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.AddCollectionItems, resp.collection.UpdatedAt, resp.collection.Version)
            {
                CollectionItemIds = resp.deleteFileIds
            };

            var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);

            if (noteStatus.IsShared)
            {
                var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
                await appSignalRService.UpdateVideosCollection(connections, updates);
            }

            var res = new UpdateCollectionContentResult(resp.collection.Id, resp.collection.Version, resp.collection.UpdatedAt, resp.deleteFileIds);
            return new OperationResult<UpdateCollectionContentResult>(success: true, res);
        }

    }
}