using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Services.History;
using BI.SignalR;
using Common;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets.InnerNote;
using Domain.Commands.Files;
using Domain.Commands.NoteInner.FileContent.Audios;
using Domain.Commands.NoteInner.FileContent.Videos;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public class FullNoteVideosCollectionHandlerCommand : FullNoteBaseCollection,
        IRequestHandler<UnlinkVideosCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<RemoveVideosFromCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<TransformToVideosCollectionCommand, OperationResult<VideosCollectionNoteDTO>>,
        IRequestHandler<AddVideosToCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<UpdateVideosCollectionInfoCommand, OperationResult<Unit>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly VideosCollectionNoteRepository videoNoteRepository;

        private readonly VideoNoteAppFileRepository videoNoteAppFileRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        public FullNoteVideosCollectionHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            FileRepository fileRepository,
            AppFileUploadInfoRepository appFileUploadInfoRepository,
            VideosCollectionNoteRepository videoNoteRepository,
            VideoNoteAppFileRepository videoNoteAppFileRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService) : base(appFileUploadInfoRepository, fileRepository)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.videoNoteRepository = videoNoteRepository;
            this.videoNoteAppFileRepository = videoNoteAppFileRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
        }


        public async Task<OperationResult<Unit>> Handle(UnlinkVideosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var videos = await videoNoteAppFileRepository.GetWhereAsync(x => x.VideosCollectionNoteId == request.ContentId);
 
                if (videos.Any())
                {
                    var ids = videos.Select(x => x.AppFileId).ToArray();
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

        public async Task<OperationResult<Unit>> Handle(RemoveVideosFromCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await videoNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                var collectionItems = await videoNoteAppFileRepository.GetWhereAsync(x => request.FileIds.Contains(x.AppFileId));
                if (collection != null && collectionItems != null && collectionItems.Any())
                {
                    await videoNoteAppFileRepository.RemoveRangeAsync(collectionItems);

                    var idsToUnlink = collectionItems.Select(x => x.AppFileId);
                    await MarkAsUnlinked(idsToUnlink.ToArray());

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await videoNoteRepository.UpdateAsync(collection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.DeleteCollectionItems, collection.UpdatedAt)
                    {
                        CollectionItemIds = idsToUnlink
                    };
                    await appSignalRService.UpdateVideosCollection(request.NoteId, permissions.User.Email, updates);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<VideosCollectionNoteDTO>> Handle(TransformToVideosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
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

                    var collection = new VideosCollectionNote()
                    {
                        NoteId = request.NoteId,
                        Order = contentForRemove.Order,
                    };

                    await videoNoteRepository.AddAsync(collection);

                    await transaction.CommitAsync();

                    var result = new VideosCollectionNoteDTO(collection.Id, collection.Order, collection.UpdatedAt, collection.Name, null);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.Transform, collection.UpdatedAt)
                    {
                        Collection = result
                    };
                    await appSignalRService.UpdateVideosCollection(request.NoteId, permissions.User.Email, updates);

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
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var videosCollection = await videoNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (videosCollection != null)
                {

                    videosCollection.Name = request.Name;
                    videosCollection.UpdatedAt = DateTimeProvider.Time;

                    await videoNoteRepository.UpdateAsync(videosCollection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.Update, videosCollection.UpdatedAt)
                    {
                        Name = request.Name,
                    };
                    await appSignalRService.UpdateVideosCollection(request.NoteId, permissions.User.Email, updates);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(AddVideosToCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await videoNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                if (collection != null)
                {
                    var existCollectionItems = await videoNoteAppFileRepository.GetWhereAsync(x => request.FileIds.Contains(x.AppFileId));
                    var existCollectionItemsIds = existCollectionItems.Select(x => x.AppFileId);

                    var collectionItems = request.FileIds.Except(existCollectionItemsIds).Select(id => new VideoNoteAppFile { AppFileId = id, VideosCollectionNoteId = collection.Id });
                    await videoNoteAppFileRepository.AddRangeAsync(collectionItems);

                    var idsToLink = collectionItems.Select(x => x.AppFileId);
                    await MarkAsLinked(idsToLink.ToArray());

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await videoNoteRepository.UpdateAsync(collection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.AddCollectionItems, collection.UpdatedAt)
                    {
                        CollectionItemIds = idsToLink
                    };
                    await appSignalRService.UpdateVideosCollection(request.NoteId, permissions.User.Email, updates);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

    }
}
