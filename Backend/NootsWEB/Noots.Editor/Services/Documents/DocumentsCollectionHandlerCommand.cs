using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets.InnerNote;
using Domain.Commands.NoteInner.FileContent.Documents;
using Domain.Commands.NoteInner.FileContent.Texts.Entities;
using MediatR;
using Microsoft.Extensions.Logging;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.History.Impl;
using Noots.Permissions.Queries;
using Noots.SignalrUpdater.Impl;

namespace Noots.Editor.Services.Documents
{
    public class DocumentsCollectionHandlerCommand :
        BaseCollectionHandler,
        IRequestHandler<RemoveDocumentsFromCollectionCommand, OperationResult<UpdateCollectionContentResult>>,
        IRequestHandler<TransformToDocumentsCollectionCommand, OperationResult<DocumentsCollectionNoteDTO>>,
        IRequestHandler<AddDocumentsToCollectionCommand, OperationResult<UpdateCollectionContentResult>>,
        IRequestHandler<UpdateDocumentsCollectionInfoCommand, OperationResult<UpdateBaseContentResult>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        private readonly ILogger<DocumentsCollectionHandlerCommand> logger;

        public DocumentsCollectionHandlerCommand(
                IMediator _mediator,
                BaseNoteContentRepository baseNoteContentRepository,
                CollectionNoteRepository documentNoteRepository,
                CollectionAppFileRepository documentNoteAppFileRepository,
                HistoryCacheService historyCacheService,
                AppSignalRService appSignalRService,
                CollectionLinkedService collectionLinkedService,
                ILogger<DocumentsCollectionHandlerCommand> logger) : base(documentNoteRepository, documentNoteAppFileRepository, collectionLinkedService)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.logger = logger;
        }


        public async Task<OperationResult<UpdateCollectionContentResult>> Handle(RemoveDocumentsFromCollectionCommand request, CancellationToken cancellationToken)
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

            await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

            if (permissions.IsMultiplyUpdate)
            {
                var updates = new UpdateDocumentsCollectionWS(request.ContentId, UpdateOperationEnum.DeleteCollectionItems, resp.collection.UpdatedAt, resp.collection.Version)
                {
                    CollectionItemIds = resp.deleteFileIds
                };
                await appSignalRService.UpdateDocumentsCollection(request.NoteId, permissions.Caller.Id, updates);
            }

            var res = new UpdateCollectionContentResult(resp.collection.Id, resp.collection.Version, resp.collection.UpdatedAt, resp.deleteFileIds);
            return new OperationResult<UpdateCollectionContentResult>(success: true, res);
        }

        public async Task<OperationResult<UpdateBaseContentResult>> Handle(UpdateDocumentsCollectionInfoCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await collectionNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (collection != null)
                {
                    collection.Name = request.Name;
                    collection.SetDateAndVersion();

                    await collectionNoteRepository.UpdateAsync(collection);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                    var updates = new UpdateDocumentsCollectionWS(request.ContentId, UpdateOperationEnum.Update, collection.UpdatedAt, collection.Version)
                    {
                        Name = request.Name,
                    };

                    if (permissions.IsMultiplyUpdate)
                    {
                        await appSignalRService.UpdateDocumentsCollection(request.NoteId, permissions.Caller.Id, updates);
                    }

                    var res = new UpdateBaseContentResult(collection.Id, collection.Version, collection.UpdatedAt);
                    return new OperationResult<UpdateBaseContentResult>(success: true, res);
                }

                return new OperationResult<UpdateBaseContentResult>().SetNotFound();
            }
            return new OperationResult<UpdateBaseContentResult>().SetNoPermissions();
        }

        public async Task<OperationResult<DocumentsCollectionNoteDTO>> Handle(TransformToDocumentsCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var contentForRemove = await baseNoteContentRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (contentForRemove == null)
                {
                    return new OperationResult<DocumentsCollectionNoteDTO>().SetNotFound();
                }

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForRemove);

                    var documentNote = new CollectionNote(FileTypeEnum.Document)
                    {
                        NoteId = request.NoteId,
                        Order = contentForRemove.Order,
                    };

                    await collectionNoteRepository.AddAsync(documentNote);

                    await transaction.CommitAsync();

                    var result = new DocumentsCollectionNoteDTO(documentNote.Id, documentNote.Order, documentNote.UpdatedAt, documentNote.Name, null, 1);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                    var updates = new UpdateDocumentsCollectionWS(request.ContentId, UpdateOperationEnum.Transform, documentNote.UpdatedAt, documentNote.Version)
                    {
                        CollectionItemIds = new List<Guid> { contentForRemove.Id },
                        Collection = result
                    };

                    if (permissions.IsMultiplyUpdate)
                    {
                        await appSignalRService.UpdateDocumentsCollection(request.NoteId, permissions.Caller.Id, updates);
                    }

                    return new OperationResult<DocumentsCollectionNoteDTO>(success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    logger.LogError(e.ToString());
                }
            }

            return new OperationResult<DocumentsCollectionNoteDTO>().SetNoPermissions();
        }

        public async Task<OperationResult<UpdateCollectionContentResult>> Handle(AddDocumentsToCollectionCommand request, CancellationToken cancellationToken)
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

            await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

            var updates = new UpdateDocumentsCollectionWS(request.ContentId, UpdateOperationEnum.AddCollectionItems, resp.collection.UpdatedAt, resp.collection.Version)
            {
                CollectionItemIds = resp.deleteFileIds
            };

            if (permissions.IsMultiplyUpdate)
            {
                await appSignalRService.UpdateDocumentsCollection(request.NoteId, permissions.Caller.Id, updates);
            }

            var res = new UpdateCollectionContentResult(resp.collection.Id, resp.collection.Version, resp.collection.UpdatedAt, resp.deleteFileIds);
            return new OperationResult<UpdateCollectionContentResult>(success: true, res);
        }
    }
}
