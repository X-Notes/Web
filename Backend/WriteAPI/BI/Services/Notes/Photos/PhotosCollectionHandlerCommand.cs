using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Services.History;
using BI.SignalR;
using Common;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DTO;
using Common.DTO.Notes.Collection;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets.InnerNote;
using Domain.Commands.Files;
using Domain.Commands.NoteInner.FileContent.Photos;
using Domain.Queries.Permissions;
using MediatR;
using Microsoft.Extensions.Logging;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes.Photos
{
    public class PhotosCollectionHandlerCommand :
        IRequestHandler<RemovePhotosFromCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<UpdatePhotosCollectionInfoCommand, OperationResult<Unit>>,
        IRequestHandler<TransformToPhotosCollectionCommand, OperationResult<PhotosCollectionNoteDTO>>,
        IRequestHandler<AddPhotosToCollectionCommand, OperationResult<Unit>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly CollectionNoteRepository collectionNoteRepository;

        private readonly CollectionAppFileRepository collectionNoteAppFileRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        private readonly CollectionLinkedService collectionLinkedService;

        private readonly ILogger<PhotosCollectionHandlerCommand> logger;

        public PhotosCollectionHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            CollectionNoteRepository collectionNoteRepository,
            CollectionAppFileRepository collectionNoteAppFileRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService,
            CollectionLinkedService collectionLinkedService,
            ILogger<PhotosCollectionHandlerCommand> logger)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.collectionNoteRepository = collectionNoteRepository;
            this.collectionNoteAppFileRepository = collectionNoteAppFileRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.collectionLinkedService = collectionLinkedService;
            this.logger = logger;
        }

        public async Task<OperationResult<Unit>> Handle(RemovePhotosFromCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var collection = await collectionNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                var collectionItems = await collectionNoteAppFileRepository.GetCollectionItems(request.FileIds, request.ContentId);
                if (collection != null && collectionItems != null && collectionItems.Any())
                {
                    await collectionNoteAppFileRepository.RemoveRangeAsync(collectionItems);
                    var fileIds = collectionItems.Select(x => x.AppFileId);

                    var data = collectionItems.Select(x => new UnlinkMetaData(x.AppFileId));
                    var idsToUnlink = await collectionLinkedService.TryToUnlink(data);

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await collectionNoteRepository.UpdateAsync(collection);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                    if (permissions.IsMultiplyUpdate)
                    {
                        var updates = new UpdatePhotosCollectionWS(request.ContentId, UpdateOperationEnum.DeleteCollectionItems, collection.UpdatedAt)
                        {
                            CollectionItemIds = fileIds
                        };
                        await appSignalRService.UpdatePhotosCollection(request.NoteId, permissions.Caller.Id, updates);
                    }

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }


        public async Task<OperationResult<Unit>> Handle(UpdatePhotosCollectionInfoCommand request, CancellationToken cancellationToken)
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

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await baseNoteContentRepository.UpdateAsync(collection);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                    var updates = new UpdatePhotosCollectionWS(request.ContentId, UpdateOperationEnum.Update, collection.UpdatedAt)
                    {
                        Name = request.Name,
                        CountInRow = request.Count,
                        Height = request.Height,
                        Width = request.Width
                    };

                    if (permissions.IsMultiplyUpdate)
                    {
                        await appSignalRService.UpdatePhotosCollection(request.NoteId, permissions.Caller.Id, updates);
                    }

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
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

                    collection.SetMetaDataPhotos("100%", "auto", 2);

                    await collectionNoteRepository.AddAsync(collection);

                    await transaction.CommitAsync();

                    var result = new PhotosCollectionNoteDTO(null, collection.Name, collection.MetaData.Width, collection.MetaData.Height,
                                        collection.Id, collection.Order, collection.MetaData.CountInRow, collection.UpdatedAt);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                    var updates = new UpdatePhotosCollectionWS(request.ContentId, UpdateOperationEnum.Transform, collection.UpdatedAt)
                    {
                        CollectionItemIds = new List<Guid> { contentForRemove.Id },
                        Collection = result
                    };

                    if (permissions.IsMultiplyUpdate)
                    {
                        await appSignalRService.UpdatePhotosCollection(request.NoteId, permissions.Caller.Id, updates);
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


        public async Task<OperationResult<Unit>> Handle(AddPhotosToCollectionCommand request, CancellationToken cancellationToken)
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
                    await collectionLinkedService.TryLink(idsToLink);

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await collectionNoteRepository.UpdateAsync(collection);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                    var updates = new UpdatePhotosCollectionWS(request.ContentId, UpdateOperationEnum.AddCollectionItems, collection.UpdatedAt)
                    {
                        CollectionItemIds = idsToLink
                    };

                    if (permissions.IsMultiplyUpdate)
                    {
                        await appSignalRService.UpdatePhotosCollection(request.NoteId, permissions.Caller.Id, updates);
                    }

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }
    }
}
