using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Services.History;
using BI.SignalR;
using Common;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DTO;
using Common.DTO.Notes.Collection;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets.InnerNote;
using Domain.Commands.NoteInner.FileContent.Videos;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public class FullNoteVideosCollectionHandlerCommand :
        IRequestHandler<RemoveVideosFromCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<TransformToVideosCollectionCommand, OperationResult<VideosCollectionNoteDTO>>,
        IRequestHandler<AddVideosToCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<UpdateVideosCollectionInfoCommand, OperationResult<Unit>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly CollectionNoteRepository collectionNoteRepository;

        private readonly CollectionAppFileRepository collectionNoteAppFileRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        private readonly CollectionLinkedService collectionLinkedService;

        public FullNoteVideosCollectionHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            CollectionNoteRepository collectionNoteRepository,
            CollectionAppFileRepository collectionNoteAppFileRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService,
            CollectionLinkedService collectionLinkedService)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.collectionNoteRepository = collectionNoteRepository;
            this.collectionNoteAppFileRepository = collectionNoteAppFileRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.collectionLinkedService = collectionLinkedService;
        }

        public async Task<OperationResult<Unit>> Handle(RemoveVideosFromCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await collectionNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                var collectionItems = await collectionNoteAppFileRepository.GetWhereAsync(x => request.FileIds.Contains(x.AppFileId));
                if (collection != null && collectionItems != null && collectionItems.Any())
                {
                    await collectionNoteAppFileRepository.RemoveRangeAsync(collectionItems);

                    var data = collectionItems.Select(x => new UnlinkMetaData { Id = x.AppFileId });
                    var idsToUnlink =  await collectionLinkedService.TryToUnlink(data);

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await collectionNoteRepository.UpdateAsync(collection);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                    var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.DeleteCollectionItems, collection.UpdatedAt)
                    {
                        CollectionItemIds = idsToUnlink
                    };

                    if (permissions.IsMultiplyUpdate)
                    {
                        await appSignalRService.UpdateVideosCollection(request.NoteId, permissions.Caller.Id, updates);
                    }

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
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

                    var collection = new CollectionNote(FileTypeEnum.Video)
                    {
                        NoteId = request.NoteId,
                        Order = contentForRemove.Order,
                    };

                    await collectionNoteRepository.AddAsync(collection);

                    await transaction.CommitAsync();

                    var result = new VideosCollectionNoteDTO(collection.Id, collection.Order, collection.UpdatedAt, collection.Name, null);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                    var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.Transform, collection.UpdatedAt)
                    {
                        Collection = result
                    };

                    if (permissions.IsMultiplyUpdate)
                    {
                        await appSignalRService.UpdateVideosCollection(request.NoteId, permissions.Caller.Id, updates);
                    }

                    return new OperationResult<VideosCollectionNoteDTO>(success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
            }

            return new OperationResult<VideosCollectionNoteDTO>().SetNoPermissions();
        }


        public async Task<OperationResult<Unit>> Handle(UpdateVideosCollectionInfoCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var videosCollection = await collectionNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (videosCollection != null)
                {

                    videosCollection.Name = request.Name;
                    videosCollection.UpdatedAt = DateTimeProvider.Time;

                    await collectionNoteRepository.UpdateAsync(videosCollection);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                    var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.Update, videosCollection.UpdatedAt)
                    {
                        Name = request.Name,
                    };

                    if (permissions.IsMultiplyUpdate)
                    {
                        await appSignalRService.UpdateVideosCollection(request.NoteId, permissions.Caller.Id, updates);
                    }

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(AddVideosToCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await collectionNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                if (collection != null)
                {
                    var existCollectionItems = await collectionNoteAppFileRepository.GetWhereAsync(x => request.FileIds.Contains(x.AppFileId));
                    var existCollectionItemsIds = existCollectionItems.Select(x => x.AppFileId);

                    var collectionItems = request.FileIds.Except(existCollectionItemsIds).Select(id => new CollectionNoteAppFile { AppFileId = id, CollectionNoteId = collection.Id });
                    await collectionNoteAppFileRepository.AddRangeAsync(collectionItems);

                    var idsToLink = collectionItems.Select(x => x.AppFileId);
                    await collectionLinkedService.TryLink(idsToLink.ToArray());

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await collectionNoteRepository.UpdateAsync(collection);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                    var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.AddCollectionItems, collection.UpdatedAt)
                    {
                        CollectionItemIds = idsToLink
                    };

                    if (permissions.IsMultiplyUpdate)
                    {
                        await appSignalRService.UpdateVideosCollection(request.NoteId, permissions.Caller.Id, updates);
                    }

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

    }
}
