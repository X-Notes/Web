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
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets.InnerNote;
using Domain.Commands.NoteInner.FileContent.Audios;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public class FullNoteAudiosCollectionHandlerCommand :
                IRequestHandler<UnlinkFilesAndRemoveAudiosCollectionsCommand, OperationResult<Unit>>,
                IRequestHandler<RemoveAudiosFromCollectionCommand, OperationResult<Unit>>,
                IRequestHandler<UpdateAudiosCollectionInfoCommand, OperationResult<Unit>>,
                IRequestHandler<TransformToAudiosCollectionCommand, OperationResult<AudiosCollectionNoteDTO>>,
                IRequestHandler<AddAudiosToCollectionCommand, OperationResult<Unit>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly CollectionNoteRepository collectionNoteRepository;

        private readonly CollectionAppFileRepository collectionNoteAppFileRepository;

        private readonly HistoryCacheServiceStorage historyCacheService;

        private readonly AppSignalRService appSignalRService;

        private readonly CollectionLinkedService collectionLinkedService;

        public FullNoteAudiosCollectionHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            CollectionNoteRepository collectionNoteRepository,
            CollectionAppFileRepository collectionNoteAppFileRepository,
            HistoryCacheServiceStorage historyCacheService,
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


        public async Task<OperationResult<Unit>> Handle(UnlinkFilesAndRemoveAudiosCollectionsCommand request, CancellationToken cancellationToken)
        {
            async Task<OperationResult<Unit>> UnLink()
            {
                var audios = await collectionNoteAppFileRepository.GetAppFilesByContentIds(request.ContentIds);
                if (audios.Any())
                {
                    var files = audios.Select(x => x.AppFile);
                    var ids = files.Select(x => x.Id).ToList();
                    var imageFileIds = files.Where(x => x.MetaData != null && x.MetaData.ImageFileId.HasValue).Select(x => x.MetaData.ImageFileId.Value);
                    ids.AddRange(imageFileIds);
                    ids = ids.Distinct().ToList();

                    await collectionNoteAppFileRepository.RemoveRangeAsync(audios);
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

        public async Task<OperationResult<Unit>> Handle(RemoveAudiosFromCollectionCommand request, CancellationToken cancellationToken)
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

                    var idsToUnlink = collectionItems.Select(x => x.AppFileId);
                    await collectionLinkedService.TryToUnlink(idsToUnlink.ToArray());

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await collectionNoteRepository.UpdateAsync(collection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id, permissions.Author.Email);

                    var updates = new UpdateAudiosCollectionWS(request.ContentId, UpdateOperationEnum.DeleteCollectionItems, collection.UpdatedAt) 
                    { 
                        CollectionItemIds = idsToUnlink
                    };
                    await appSignalRService.UpdateAudiosCollection(request.NoteId, permissions.Caller.Email, updates);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(UpdateAudiosCollectionInfoCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var audiosCollection = await collectionNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if(audiosCollection != null)
                {
                    audiosCollection.Name = request.Name;
                    audiosCollection.UpdatedAt = DateTimeProvider.Time;

                    await collectionNoteRepository.UpdateAsync(audiosCollection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id, permissions.Author.Email);

                    var updates = new UpdateAudiosCollectionWS(request.ContentId, UpdateOperationEnum.Update, audiosCollection.UpdatedAt)
                    {
                        Name = request.Name,
                    };
                    await appSignalRService.UpdateAudiosCollection(request.NoteId, permissions.Caller.Email, updates);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }


        public async Task<OperationResult<AudiosCollectionNoteDTO>> Handle(TransformToAudiosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
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

                    var collection = new CollectionNote(FileTypeEnum.Audio)
                    {
                        NoteId = request.NoteId,
                        Order = contentForRemove.Order,
                    };

                    await collectionNoteRepository.AddAsync(collection);

                    await transaction.CommitAsync();

                    var result = new AudiosCollectionNoteDTO(collection.Id, collection.Order, collection.UpdatedAt, collection.Name, null);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id, permissions.Author.Email);

                    var updates = new UpdateAudiosCollectionWS(request.ContentId, UpdateOperationEnum.Transform, collection.UpdatedAt)
                    {
                        Collection = result
                    };
                    await appSignalRService.UpdateAudiosCollection(request.NoteId, permissions.Caller.Email, updates);

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

        public async Task<OperationResult<Unit>> Handle(AddAudiosToCollectionCommand request, CancellationToken cancellationToken)
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

                    var updates = new UpdateAudiosCollectionWS(request.ContentId, UpdateOperationEnum.AddCollectionItems, collection.UpdatedAt)
                    {
                        CollectionItemIds = idsToLink
                    };
                    await appSignalRService.UpdateAudiosCollection(request.NoteId, permissions.Caller.Email, updates);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }
    }
}
