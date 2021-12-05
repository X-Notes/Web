using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Services.History;
using BI.SignalR;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
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
        IRequestHandler<RemoveDocumentFromCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<TransformToDocumentsCollectionCommand,  OperationResult<DocumentsCollectionNoteDTO>>,
        IRequestHandler<UpdateDocumentsContentsCommand, OperationResult<Unit>>
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

        public async Task<OperationResult<Unit>> Handle(RemoveDocumentFromCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await documentNoteRepository.GetOneIncludeDocumentNoteAppFiles(request.ContentId);

                if(collection != null)
                {
                    collection.DocumentNoteAppFiles = collection.DocumentNoteAppFiles.Where(x => x.AppFileId != request.DocumentId).ToList();
                    collection.UpdatedAt = DateTimeOffset.Now;

                    await documentNoteRepository.UpdateAsync(collection);
                    await MarkAsUnlinked(request.DocumentId);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

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
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

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

        public async Task<OperationResult<Unit>> Handle(UpdateDocumentsContentsCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                if (request.Documents.Count == 1)
                {
                    await UpdateOne(request.Documents.First());
                }
                else
                {
                    await UpdateMany(request.Documents);
                }

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                // TODO DEADLOCK
                return new OperationResult<Unit>(success: true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        private async Task UpdateMany(List<DocumentsCollectionNoteDTO> entities)
        {
            foreach (var entity in entities)
            {
                await UpdateOne(entity);
            }
        }

        private async Task UpdateOne(DocumentsCollectionNoteDTO entity)
        {
            var entityForUpdate = await documentNoteRepository.GetOneIncludeDocumentNoteAppFiles(entity.Id);
            if (entityForUpdate != null)
            {
                entityForUpdate.UpdatedAt = DateTimeOffset.Now;
                entityForUpdate.Name = entity.Name;

                var databaseFileIds = entityForUpdate.DocumentNoteAppFiles.Select(x => x.AppFileId);
                var entityFileIds = entity.Documents.Select(x => x.FileId);

                var idsForDelete = databaseFileIds.Except(entityFileIds);
                var idsForAdd = entityFileIds.Except(databaseFileIds);

                if (idsForDelete.Any() || idsForAdd.Any())
                {
                    entityForUpdate.DocumentNoteAppFiles = entity.Documents.Select(x =>
                        new DocumentNoteAppFile { AppFileId = x.FileId, DocumentsCollectionNoteId = entityForUpdate.Id }).ToList();
                }

                if (idsForDelete.Any())
                {
                    await MarkAsUnlinked(idsForDelete.ToArray());
                }

                if (idsForAdd.Any())
                {
                    await MarkAsLinked(idsForAdd.ToArray());
                }
            }
            await documentNoteRepository.UpdateAsync(entityForUpdate);
        }
    }
}
