using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Services.History;
using BI.SignalR;
using Common;
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
    public class FullNoteAudiosCollectionHandlerCommand : FullNoteBaseCollection,
                IRequestHandler<UnlinkAudiosCollectionCommand, OperationResult<Unit>>,
                IRequestHandler<RemoveAudiosFromCollectionCommand, OperationResult<Unit>>,
                IRequestHandler<UpdateAudiosCollectionInfoCommand, OperationResult<Unit>>,
                IRequestHandler<TransformToAudiosCollectionCommand, OperationResult<AudiosCollectionNoteDTO>>,
                IRequestHandler<AddAudiosToCollectionCommand, OperationResult<Unit>>
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
                else
                {
                    return new OperationResult<Unit>(success: true, Unit.Value, OperationResultAdditionalInfo.NoAnyFile);
                }
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(RemoveAudiosFromCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await audioNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                var collectionItems = await audioNoteAppFileRepository.GetWhereAsync(x => request.FileIds.Contains(x.AppFileId));
                if (collection != null && collectionItems != null && collectionItems.Any())
                {
                    await audioNoteAppFileRepository.RemoveRangeAsync(collectionItems);

                    var idsToUnlink = collectionItems.Select(x => x.AppFileId);
                    await MarkAsUnlinked(idsToUnlink.ToArray());

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await audioNoteRepository.UpdateAsync(collection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var updates = new UpdateAudiosCollectionWS(request.ContentId, UpdateOperationEnum.DeleteCollectionItems, collection.UpdatedAt) 
                    { 
                        CollectionItemIds = idsToUnlink
                    };
                    await appSignalRService.UpdateAudiosCollection(request.NoteId, permissions.User.Email, updates);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(UpdateAudiosCollectionInfoCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var audiosCollection = await audioNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if(audiosCollection != null)
                {
                    audiosCollection.Name = request.Name;
                    audiosCollection.UpdatedAt = DateTimeProvider.Time;

                    await audioNoteRepository.UpdateAsync(audiosCollection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var updates = new UpdateAudiosCollectionWS(request.ContentId, UpdateOperationEnum.Update, audiosCollection.UpdatedAt)
                    {
                        Name = request.Name,
                    };
                    await appSignalRService.UpdateAudiosCollection(request.NoteId, permissions.User.Email, updates);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
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

                    var collection = new AudiosCollectionNote()
                    {
                        NoteId = request.NoteId,
                        Order = contentForRemove.Order,
                    };

                    await audioNoteRepository.AddAsync(collection);

                    await transaction.CommitAsync();

                    var result = new AudiosCollectionNoteDTO(collection.Id, collection.Order, collection.UpdatedAt, collection.Name, null);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var updates = new UpdateAudiosCollectionWS(request.ContentId, UpdateOperationEnum.Transform, collection.UpdatedAt)
                    {
                        Collection = result
                    };
                    await appSignalRService.UpdateAudiosCollection(request.NoteId, permissions.User.Email, updates);

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
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await audioNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                if (collection != null)
                {
                    var existCollectionItems = await audioNoteAppFileRepository.GetWhereAsync(x => request.FileIds.Contains(x.AppFileId));
                    var existCollectionItemsIds = existCollectionItems.Select(x => x.AppFileId);

                    var collectionItems = request.FileIds.Except(existCollectionItemsIds).Select(id => new AudioNoteAppFile { AppFileId = id, AudiosCollectionNoteId = collection.Id });
                    await audioNoteAppFileRepository.AddRangeAsync(collectionItems);

                    var idsToLink = collectionItems.Select(x => x.AppFileId);
                    await MarkAsLinked(idsToLink.ToArray());

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await audioNoteRepository.UpdateAsync(collection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var updates = new UpdateAudiosCollectionWS(request.ContentId, UpdateOperationEnum.AddCollectionItems, collection.UpdatedAt)
                    {
                        CollectionItemIds = idsToLink
                    };
                    await appSignalRService.UpdateAudiosCollection(request.NoteId, permissions.User.Email, updates);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }
    }
}
