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
using Common.Interfaces.Note;
using Domain.Commands.Files;
using Domain.Commands.NoteInner.FileContent.Documents;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public class FullNoteDocumentsCollectionHandlerCommand : FullNoteBaseCollection,
        IRequestHandler<UnlinkDocumentsCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<RemoveDocumentsFromCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<TransformToDocumentsCollectionCommand,  OperationResult<DocumentsCollectionNoteDTO>>,
        IRequestHandler<AddDocumentsToCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<UpdateDocumentsCollectionInfoCommand, OperationResult<Unit>>
    {

        private readonly IMediator _mediator;

        private readonly DocumentsCollectionNoteRepository documentNoteRepository;

        private readonly DocumentNoteAppFileRepository documentNoteAppFileRepository;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        public FullNoteDocumentsCollectionHandlerCommand(
                                        IMediator _mediator,
                                        BaseNoteContentRepository baseNoteContentRepository,
                                        FileRepository fileRepository,
                                        AppFileUploadInfoRepository appFileUploadInfoRepository,
                                        DocumentsCollectionNoteRepository documentNoteRepository,
                                        DocumentNoteAppFileRepository documentNoteAppFileRepository,
                                        HistoryCacheService historyCacheService,
                                        AppSignalRService appSignalRService) : base(appFileUploadInfoRepository, fileRepository)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.documentNoteRepository = documentNoteRepository;
            this.documentNoteAppFileRepository = documentNoteAppFileRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
        }

        public async Task<OperationResult<Unit>> Handle(UnlinkDocumentsCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var documents = await documentNoteAppFileRepository.GetWhereAsync(x => x.DocumentsCollectionNoteId == request.ContentId);

                if (documents.Any())
                {
                    var ids = documents.Select(x => x.AppFileId).ToArray();
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

        public async Task<OperationResult<Unit>> Handle(RemoveDocumentsFromCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await documentNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                var collectionItems = await documentNoteAppFileRepository.GetWhereAsync(x => request.FileIds.Contains(x.AppFileId));
                if (collection != null && collectionItems != null && collectionItems.Any())
                {
                    await documentNoteAppFileRepository.RemoveRangeAsync(collectionItems);

                    var idsToUnlink = collectionItems.Select(x => x.AppFileId);
                    await MarkAsUnlinked(idsToUnlink.ToArray());

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await documentNoteRepository.UpdateAsync(collection); // TODO Maybe need transaction

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var updates = new UpdateDocumentsCollectionWS(request.ContentId, UpdateOperationEnum.DeleteCollectionItems, collection.UpdatedAt) 
                    {
                        CollectionItemIds = idsToUnlink
                    };
                    await appSignalRService.UpdateDocumentsCollection(request.NoteId, permissions.User.Email, updates);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(UpdateDocumentsCollectionInfoCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await documentNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (collection != null)
                {
                    collection.Name = request.Name;
                    collection.UpdatedAt = DateTimeProvider.Time;

                    await documentNoteRepository.UpdateAsync(collection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var updates = new UpdateDocumentsCollectionWS(request.ContentId, UpdateOperationEnum.Update, collection.UpdatedAt) { 
                        Name = request.Name,
                    };
                    await appSignalRService.UpdateDocumentsCollection(request.NoteId, permissions.User.Email, updates);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }
            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<DocumentsCollectionNoteDTO>> Handle(TransformToDocumentsCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
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

                    var documentNote = new DocumentsCollectionNote()
                    {
                        NoteId = request.NoteId,
                        Order = contentForRemove.Order,
                    };

                    await documentNoteRepository.AddAsync(documentNote);

                    await transaction.CommitAsync();

                    var result = new DocumentsCollectionNoteDTO(documentNote.Id, documentNote.Order, documentNote.UpdatedAt, documentNote.Name, null);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var updates = new UpdateDocumentsCollectionWS(request.ContentId, UpdateOperationEnum.Transform, documentNote.UpdatedAt)
                    {
                        Collection = result
                    };
                    await appSignalRService.UpdateDocumentsCollection(request.NoteId, permissions.User.Email, updates);

                    return new OperationResult<DocumentsCollectionNoteDTO>(success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
            }

            return new OperationResult<DocumentsCollectionNoteDTO>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(AddDocumentsToCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await documentNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                if (collection != null)
                {
                    var existCollectionItems = await documentNoteAppFileRepository.GetWhereAsync(x => request.FileIds.Contains(x.AppFileId));
                    var existCollectionItemsIds = existCollectionItems.Select(x => x.AppFileId);

                    var collectionItems = request.FileIds.Except(existCollectionItemsIds).Select(id => new DocumentNoteAppFile { AppFileId = id, DocumentsCollectionNoteId = collection.Id });
                    await documentNoteAppFileRepository.AddRangeAsync(collectionItems);

                    var idsToLink = collectionItems.Select(x => x.AppFileId);
                    await MarkAsLinked(idsToLink.ToArray());

                    collection.UpdatedAt = DateTimeProvider.Time;
                    await documentNoteRepository.UpdateAsync(collection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var updates = new UpdateDocumentsCollectionWS(request.ContentId, UpdateOperationEnum.AddCollectionItems, collection.UpdatedAt)
                    {
                        CollectionItemIds = idsToLink
                    };
                    await appSignalRService.UpdateDocumentsCollection(request.NoteId, permissions.User.Email, updates);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }
    }
}
