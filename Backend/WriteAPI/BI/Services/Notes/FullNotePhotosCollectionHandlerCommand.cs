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
using Domain.Commands.NoteInner.FileContent.Photos;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public class FullNotePhotosCollectionHandlerCommand : FullNoteBaseCollection,
        IRequestHandler<UnlinkPhotosCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<RemovePhotoFromCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<ChangePhotosCollectionRowCountCommand, OperationResult<Unit>>,
        IRequestHandler<ChangePhotosCollectionSizeCommand, OperationResult<Unit>>,
        IRequestHandler<TransformToPhotosCollectionCommand, OperationResult<PhotosCollectionNoteDTO>>,
        IRequestHandler<UpdatePhotosContentsCommand, OperationResult<Unit>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly PhotosCollectionNoteRepository photosCollectionNoteRepository;

        private readonly PhotoNoteAppFileRepository photoNoteAppFileRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        public FullNotePhotosCollectionHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            FileRepository fileRepository,
            AppFileUploadInfoRepository appFileUploadInfoRepository,
            PhotosCollectionNoteRepository photosCollectionNoteRepository,
            PhotoNoteAppFileRepository photoNoteAppFileRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService) : base(appFileUploadInfoRepository, fileRepository)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.photosCollectionNoteRepository = photosCollectionNoteRepository;
            this.photoNoteAppFileRepository = photoNoteAppFileRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
        }


        public async Task<OperationResult<Unit>> Handle(UnlinkPhotosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var photos = await photoNoteAppFileRepository.GetWhereAsync(x => x.PhotosCollectionNoteId == request.ContentId);

                if (photos.Any())
                {
                    var ids = photos.Select(x => x.AppFileId).ToArray();
                    await MarkAsUnlinked(ids);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(RemovePhotoFromCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var collection = await photosCollectionNoteRepository.GetOneIncludePhotoNoteAppFiles(request.ContentId);

                if(collection != null)
                {
                    collection.PhotoNoteAppFiles = collection.PhotoNoteAppFiles.Where(x => x.AppFileId != request.PhotoId).ToList();
                    collection.UpdatedAt = DateTimeOffset.Now;

                    await photosCollectionNoteRepository.UpdateAsync(collection);
                    await MarkAsUnlinked(request.PhotoId);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(ChangePhotosCollectionRowCountCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await photosCollectionNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (collection != null)
                {
                    collection.CountInRow = request.Count;
                    collection.UpdatedAt = DateTimeOffset.Now;
                    await photosCollectionNoteRepository.UpdateAsync(collection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(ChangePhotosCollectionSizeCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await photosCollectionNoteRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if(collection != null)
                {
                    collection.Height = request.Height;
                    collection.Width = request.Width;
                    collection.UpdatedAt = DateTimeOffset.Now;
                    await baseNoteContentRepository.UpdateAsync(collection);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<PhotosCollectionNoteDTO>> Handle(TransformToPhotosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
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

                    var photosCollection = new PhotosCollectionNote()
                    {
                        NoteId = request.NoteId,
                        Order = contentForRemove.Order,
                        CountInRow = 2,
                        Width = "100%",
                        Height = "auto",
                    };

                    await photosCollectionNoteRepository.AddAsync(photosCollection);

                    await transaction.CommitAsync();

                    var result = new PhotosCollectionNoteDTO(null, photosCollection.Name, photosCollection.Width, photosCollection.Height,
                        photosCollection.Id, photosCollection.Order, photosCollection.CountInRow, photosCollection.UpdatedAt);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

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

        public async Task<OperationResult<Unit>> Handle(UpdatePhotosContentsCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                if (request.Photos.Count == 1)
                {
                    await UpdateOne(request.Photos.First());
                }
                else
                {
                    await UpdateMany(request.Photos);
                }

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                // TODO DEADLOCK
                return new OperationResult<Unit>(success: true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        private async Task UpdateMany(List<PhotosCollectionNoteDTO> entities)
        {
            foreach (var entity in entities)
            {
                await UpdateOne(entity);
            }
        }

        private async Task UpdateOne(PhotosCollectionNoteDTO entity)
        {
            var entityForUpdate = await photosCollectionNoteRepository.GetOneIncludePhotoNoteAppFiles(entity.Id);
            if (entityForUpdate != null)
            {
                entityForUpdate.UpdatedAt = DateTimeOffset.Now;
                entityForUpdate.Name = entity.Name;
                entityForUpdate.Width = entity.Width;
                entityForUpdate.Height = entity.Height;
                entityForUpdate.CountInRow = entity.CountInRow;

                var databaseFileIds = entityForUpdate.PhotoNoteAppFiles.Select(x => x.AppFileId);
                var entityFileIds = entity.Photos.Select(x => x.FileId);

                var idsForDelete = databaseFileIds.Except(entityFileIds);
                var idsForAdd = entityFileIds.Except(databaseFileIds);

                if (idsForDelete.Any() || idsForAdd.Any())
                {
                    entityForUpdate.PhotoNoteAppFiles = entity.Photos.Select(x =>
                        new PhotoNoteAppFile { AppFileId = x.FileId, PhotosCollectionNoteId = entityForUpdate.Id }).ToList();
                }

                if (idsForDelete.Any())
                {
                    await MarkAsUnlinked(idsForDelete.ToArray());
                }

                if (idsForAdd.Any())
                {
                    await MarkAsLinked(idsForAdd.ToArray());
                }

                await photosCollectionNoteRepository.UpdateAsync(entityForUpdate);
            }
        }
    }
}
