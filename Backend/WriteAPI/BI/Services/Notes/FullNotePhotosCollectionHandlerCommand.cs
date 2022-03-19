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
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets.InnerNote;
using Domain.Commands.Files;
using Domain.Commands.NoteInner.FileContent.Photos;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public class FullNotePhotosCollectionHandlerCommand :
        IRequestHandler<UnlinkFilesAndRemovePhotosCollectionsCommand, OperationResult<Unit>>,
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

        public FullNotePhotosCollectionHandlerCommand(
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


        public async Task<OperationResult<Unit>> Handle(UnlinkFilesAndRemovePhotosCollectionsCommand request, CancellationToken cancellationToken)
        {
            async Task<OperationResult<Unit>> UnLink()
            {
                var photos = await collectionNoteAppFileRepository.GetWhereAsync(x => request.ContentIds.Contains(x.CollectionNoteId));

                if (photos.Any())
                {
                    await collectionNoteAppFileRepository.RemoveRangeAsync(photos);

                    var ids = photos.Select(x => x.AppFileId).ToArray();
                    await collectionLinkedService.TryToUnlink(ids.ToArray());

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }
                else
                {
                    return new OperationResult<Unit>(success: true, Unit.Value, OperationResultAdditionalInfo.NoAnyFile);
                }
            }


            if (!request.IsCheckPermissions)
            {
                return await UnLink();
            }

            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);
            if (permissions.CanWrite)
            {
                return await UnLink();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(RemovePhotosFromCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var collection = await collectionNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                var collectionItems = await collectionNoteAppFileRepository.GetWhereAsync(x => request.FileIds.Contains(x.AppFileId));
                if (collection != null && collectionItems != null && collectionItems.Any())
                {
                    await collectionNoteAppFileRepository.RemoveRangeAsync(collectionItems);

                    var idsToUnlink = collectionItems.Select(x => x.AppFileId);
                    await collectionLinkedService.TryToUnlink(idsToUnlink.ToArray());

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await collectionNoteRepository.UpdateAsync(collection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id, permissions.Author.Email);

                    var updates = new UpdatePhotosCollectionWS(request.ContentId, UpdateOperationEnum.DeleteCollectionItems, collection.UpdatedAt) 
                    { 
                        CollectionItemIds = idsToUnlink
                    };
                    await appSignalRService.UpdatePhotosCollection(request.NoteId, permissions.Caller.Email, updates);

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

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id, permissions.Author.Email);

                    var updates = new UpdatePhotosCollectionWS(request.ContentId, UpdateOperationEnum.Update, collection.UpdatedAt)
                    {
                        Name = request.Name,
                        CountInRow = request.Count,
                        Height = request.Height,
                        Width = request.Width
                    };
                    await appSignalRService.UpdatePhotosCollection(request.NoteId, permissions.Caller.Email, updates);

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

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id, permissions.Author.Email);

                    var updates = new UpdatePhotosCollectionWS(request.ContentId, UpdateOperationEnum.Transform, collection.UpdatedAt)
                    {
                        Collection = result
                    };
                    await appSignalRService.UpdatePhotosCollection(request.NoteId, permissions.Caller.Email, updates);

                    return new OperationResult<PhotosCollectionNoteDTO>(success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
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
                    await collectionLinkedService.TryLink(idsToLink.ToArray());

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await collectionNoteRepository.UpdateAsync(collection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id, permissions.Author.Email);

                    var updates = new UpdatePhotosCollectionWS(request.ContentId, UpdateOperationEnum.AddCollectionItems, collection.UpdatedAt)
                    {
                        CollectionItemIds = idsToLink
                    };
                    await appSignalRService.UpdatePhotosCollection(request.NoteId, permissions.Caller.Email, updates);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }
    }
}
