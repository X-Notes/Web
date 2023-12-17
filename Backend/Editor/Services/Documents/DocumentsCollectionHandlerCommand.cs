using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets.InnerNote;
using DatabaseContext.Repositories.NoteContent;
using Editor.Commands.Documents;
using Editor.Entities;
using History.Impl;
using MediatR;
using Microsoft.Extensions.Logging;
using Permissions.Queries;
using SignalrUpdater.Impl;

namespace Editor.Services.Documents
{
    public class DocumentsCollectionHandlerCommand :
        BaseCollectionHandler,
        IRequestHandler<RemoveDocumentsFromCollectionCommand, OperationResult<UpdateCollectionContentResult>>,
        IRequestHandler<TransformToDocumentsCollectionCommand, OperationResult<DocumentsCollectionNoteDTO>>,
        IRequestHandler<AddDocumentsToCollectionCommand, OperationResult<UpdateCollectionContentResult>>,
        IRequestHandler<UpdateDocumentsCollectionInfoCommand, OperationResult<UpdateBaseContentResult>>
    {

        private readonly IMediator _mediator;
        private readonly HistoryCacheService historyCacheService;
        private readonly AppSignalRService appSignalRService;
        private readonly NoteWSUpdateService noteWSUpdateService;
        private readonly ILogger<DocumentsCollectionHandlerCommand> logger;
        private readonly NotesMultipleUpdateService notesMultipleUpdateService;

        public DocumentsCollectionHandlerCommand(
                IMediator _mediator,
                BaseNoteContentRepository baseNoteContentRepository,
                CollectionAppFileRepository documentNoteAppFileRepository,
                HistoryCacheService historyCacheService,
                AppSignalRService appSignalRService,
                CollectionLinkedService collectionLinkedService,
                NoteWSUpdateService noteWSUpdateService,
                ILogger<DocumentsCollectionHandlerCommand> logger,
                NotesMultipleUpdateService notesMultipleUpdateService) : base(baseNoteContentRepository, documentNoteAppFileRepository, collectionLinkedService)
        {
            this._mediator = _mediator;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.noteWSUpdateService = noteWSUpdateService;
            this.logger = logger;
            this.notesMultipleUpdateService = notesMultipleUpdateService;
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

            await historyCacheService.UpdateNoteAsync(permissions.NoteId, permissions.CallerId);

            var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);
            
            if (noteStatus.IsShared)
            {
                var updates = new UpdateDocumentsCollectionWS(request.ContentId, UpdateOperationEnum.DeleteCollectionItems, resp.collection.UpdatedAt, resp.collection.Version)
                {
                    CollectionItemIds = resp.deleteFileIds
                };
                var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
                await appSignalRService.UpdateDocumentsCollection(connections, updates);
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
                var collection = await base.baseNoteContentRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (collection != null)
                {
                    collection.Name = request.Name;
                    collection.SetDateAndVersion();

                    await base.baseNoteContentRepository.UpdateAsync(collection);

                    await historyCacheService.UpdateNoteAsync(permissions.NoteId, permissions.CallerId);

                    var updates = new UpdateDocumentsCollectionWS(request.ContentId, UpdateOperationEnum.Update, collection.UpdatedAt, collection.Version)
                    {
                        Name = request.Name,
                    };

                    var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);
                    
                    if (noteStatus.IsShared)
                    {
                        var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
                        await appSignalRService.UpdateDocumentsCollection(connections, updates);
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

                    var documentNote = BaseNoteContent.CreateCollectionNote(FileTypeEnum.Document);
                    documentNote.NoteId = request.NoteId;
                    documentNote.Order = contentForRemove.Order;

                    await base.baseNoteContentRepository.AddAsync(documentNote);

                    await transaction.CommitAsync();

                    var result = new DocumentsCollectionNoteDTO(documentNote.Id, documentNote.Order, documentNote.UpdatedAt, documentNote.Name, null, 1);

                    await historyCacheService.UpdateNoteAsync(permissions.NoteId, permissions.CallerId);

                    var updates = new UpdateDocumentsCollectionWS(request.ContentId, UpdateOperationEnum.Transform, documentNote.UpdatedAt, documentNote.Version)
                    {
                        CollectionItemIds = new List<Guid> { contentForRemove.Id },
                        Collection = result
                    };

                    var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);
                    
                    if (noteStatus.IsShared)
                    {
                        var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
                        await appSignalRService.UpdateDocumentsCollection(connections, updates);
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

            await historyCacheService.UpdateNoteAsync(permissions.NoteId, permissions.CallerId);

            var updates = new UpdateDocumentsCollectionWS(request.ContentId, UpdateOperationEnum.AddCollectionItems, resp.collection.UpdatedAt, resp.collection.Version)
            {
                CollectionItemIds = resp.deleteFileIds
            };
            
            var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);

            if (noteStatus.IsShared)
            {
                var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
                await appSignalRService.UpdateDocumentsCollection(connections, updates);
            }

            var res = new UpdateCollectionContentResult(resp.collection.Id, resp.collection.Version, resp.collection.UpdatedAt, resp.deleteFileIds);
            return new OperationResult<UpdateCollectionContentResult>(success: true, res);
        }
    }
}
