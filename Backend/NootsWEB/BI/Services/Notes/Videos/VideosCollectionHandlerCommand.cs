using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DTO;
using Common.DTO.Notes.Collection;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets.InnerNote;
using Domain.Commands.NoteInner.FileContent.Texts.Entities;
using Domain.Commands.NoteInner.FileContent.Videos;
using MediatR;
using Microsoft.Extensions.Logging;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.History.Impl;
using Noots.Permissions.Queries;
using Noots.SignalrUpdater.Impl;

namespace BI.Services.Notes.Videos
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

        private readonly ILogger<VideosCollectionHandlerCommand> logger;

        public VideosCollectionHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            CollectionNoteRepository collectionNoteRepository,
            CollectionAppFileRepository collectionNoteAppFileRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService,
            CollectionLinkedService collectionLinkedService,
            ILogger<VideosCollectionHandlerCommand> logger) : base(collectionNoteRepository, collectionNoteAppFileRepository, collectionLinkedService)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.logger = logger;
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
            if(resp.collection == null)
            {
                return new OperationResult<UpdateCollectionContentResult>().SetNotFound();
            }

            await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

            if (permissions.IsMultiplyUpdate)
            {
                var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.DeleteCollectionItems, resp.collection.UpdatedAt, resp.collection.Version)
                {
                    CollectionItemIds = resp.deleteFileIds
                };
                await appSignalRService.UpdateVideosCollection(request.NoteId, permissions.Caller.Id, updates);
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

                    var collection = new CollectionNote(FileTypeEnum.Video)
                    {
                        NoteId = request.NoteId,
                        Order = contentForRemove.Order,
                    };

                    await collectionNoteRepository.AddAsync(collection);

                    await transaction.CommitAsync();

                    var result = new VideosCollectionNoteDTO(collection.Id, collection.Order, collection.UpdatedAt, collection.Name, null, 1);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                    var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.Transform, collection.UpdatedAt, collection.Version)
                    {
                        CollectionItemIds = new List<Guid> { contentForRemove.Id },
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
                var videosCollection = await collectionNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (videosCollection != null)
                {

                    videosCollection.Name = request.Name;
                    videosCollection.SetDateAndVersion();

                    await collectionNoteRepository.UpdateAsync(videosCollection);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                    var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.Update, videosCollection.UpdatedAt, videosCollection.Version)
                    {
                        Name = request.Name,
                    };

                    if (permissions.IsMultiplyUpdate)
                    {
                        await appSignalRService.UpdateVideosCollection(request.NoteId, permissions.Caller.Id, updates);
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
            if(resp.collection == null)
            {
                return new OperationResult<UpdateCollectionContentResult>().SetNotFound();
            }

            await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

            var updates = new UpdateVideosCollectionWS(request.ContentId, UpdateOperationEnum.AddCollectionItems, resp.collection.UpdatedAt, resp.collection.Version)
            {
                CollectionItemIds = resp.deleteFileIds
            };

            if (permissions.IsMultiplyUpdate)
            {
                await appSignalRService.UpdateVideosCollection(request.NoteId, permissions.Caller.Id, updates);
            }

            var res = new UpdateCollectionContentResult(resp.collection.Id, resp.collection.Version, resp.collection.UpdatedAt, resp.deleteFileIds);
            return new OperationResult<UpdateCollectionContentResult>(success: true, res);
        }

    }
}
