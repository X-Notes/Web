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
        IRequestHandler<UploadDocumentsToCollectionCommand, OperationResult<List<DocumentNoteDTO>>>
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
                var ids = documents.Select(x => x.AppFileId).ToArray();

                await MarkAsUnlinked(ids);

                return new OperationResult<Unit>(success: true, Unit.Value);
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
                collection.DocumentNoteAppFiles = collection.DocumentNoteAppFiles.Where(x => x.AppFileId != request.DocumentId).ToList();
                collection.UpdatedAt = DateTimeOffset.Now;

                await documentNoteRepository.UpdateAsync(collection);
                await MarkAsUnlinked(request.DocumentId);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<Unit>(success: true, Unit.Value);
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
                    throw new Exception("Content not found");
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

        public async Task<OperationResult<List<DocumentNoteDTO>>> Handle(UploadDocumentsToCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                // PERMISSION MEMORY
                var uploadPermission = await _mediator.Send(new GetPermissionUploadFileQuery(request.Documents.Sum(x => x.Length), permissions.Author.Id));
                if (uploadPermission == PermissionUploadFileEnum.NoCanUpload)
                {
                    return new OperationResult<List<DocumentNoteDTO>>().SetNoEnougnMemory();
                }

                // FILE LOGIC
                var filebytes = await request.Documents.GetFilesBytesAsync();
                var dbFiles = await _mediator.Send(new SaveDocumentsToNoteCommand(permissions.Author.Id, filebytes, note.Id));

                if (cancellationToken.IsCancellationRequested)
                {
                    var pathes = dbFiles.SelectMany(x => x.GetNotNullPathes()).ToList();
                    await _mediator.Send(new RemoveFilesFromStorageCommand(pathes, permissions.Author.Id.ToString()));
                    return new OperationResult<List<DocumentNoteDTO>>().SetRequestCancelled();
                }

                // UPDATING
                var documentsCollection = await documentNoteRepository.GetOneIncludeDocuments(request.ContentId);
                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    documentsCollection.Documents.AddRange(dbFiles);
                    documentsCollection.UpdatedAt = DateTimeOffset.Now;

                    await documentNoteRepository.UpdateAsync(documentsCollection);

                    await MarkAsLinked(dbFiles);
                    
                    await transaction.CommitAsync();

                    var documents = dbFiles.Select(x => new DocumentNoteDTO(x.Name, x.PathNonPhotoContent, x.Id, x.UserId)).ToList();

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<List<DocumentNoteDTO>>(success: true, documents);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), dbFiles));
                }
            }

            return new OperationResult<List<DocumentNoteDTO>>().SetNoPermissions();
        }

    }
}
