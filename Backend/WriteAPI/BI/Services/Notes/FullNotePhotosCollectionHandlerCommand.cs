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
        IRequestHandler<RemovePhotosCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<UploadPhotosToCollectionCommand, OperationResult<List<PhotoNoteDTO>>>,
        IRequestHandler<RemovePhotoFromCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<ChangePhotosCollectionRowCountCommand, OperationResult<Unit>>,
        IRequestHandler<ChangePhotosCollectionSizeCommand, OperationResult<Unit>>,
        IRequestHandler<TransformToPhotosCollectionCommand, OperationResult<PhotosCollectionNoteDTO>>
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


        public async Task<OperationResult<Unit>> Handle(RemovePhotosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var photos = await photoNoteAppFileRepository.GetWhereAsync(x => x.PhotosCollectionNoteId == request.ContentId);
                var ids = photos.Select(x => x.AppFileId).ToArray();

                await MarkAsUnlinked(ids);

                return new OperationResult<Unit>(success: true, Unit.Value);
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
                collection.PhotoNoteAppFiles = collection.PhotoNoteAppFiles.Where(x => x.AppFileId != request.PhotoId).ToList();
                collection.UpdatedAt = DateTimeOffset.Now;

                await photosCollectionNoteRepository.UpdateAsync(collection);
                await MarkAsUnlinked(request.PhotoId);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<Unit>(success: true, Unit.Value);
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
                collection.CountInRow = request.Count;
                collection.UpdatedAt = DateTimeOffset.Now;
                await photosCollectionNoteRepository.UpdateAsync(collection);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<Unit>(success: true, Unit.Value);
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
                collection.Height = request.Height;
                collection.Width = request.Width;
                collection.UpdatedAt = DateTimeOffset.Now;
                await baseNoteContentRepository.UpdateAsync(collection);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<Unit>(success: true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }


        public async Task<OperationResult<List<PhotoNoteDTO>>> Handle(UploadPhotosToCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                // PERMISSION MEMORY
                var uploadPermission = await _mediator.Send(new GetPermissionUploadFileQuery(request.Photos.Sum(x => x.Length), permissions.Author.Id));
                if (uploadPermission == PermissionUploadFileEnum.NoCanUpload)
                {
                    return new OperationResult<List<PhotoNoteDTO>>().SetNoEnougnMemory();
                }

                // FILE LOGIC
                var filebytes = await request.Photos.GetFilesBytesAsync();
                var dbFiles = await _mediator.Send(new SavePhotosToNoteCommand(permissions.Author.Id, filebytes, note.Id));

                if (cancellationToken.IsCancellationRequested)
                {
                    var pathes = dbFiles.SelectMany(x => x.GetNotNullPathes()).ToList();
                    await _mediator.Send(new RemoveFilesFromStorageCommand(pathes, permissions.Author.Id.ToString()));
                    return new OperationResult<List<PhotoNoteDTO>>().SetRequestCancelled();
                }

                // UPDATING
                var collection = await photosCollectionNoteRepository.GetOneIncludePhotos(request.ContentId);

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    collection.Photos.AddRange(dbFiles);
                    collection.UpdatedAt = DateTimeOffset.Now;

                    await photosCollectionNoteRepository.UpdateAsync(collection);

                    await MarkAsLinked(dbFiles);

                    await transaction.CommitAsync();

                    var photos = dbFiles.Select(x => new PhotoNoteDTO(x.Id, x.Name, x.PathPhotoSmall, x.PathPhotoMedium, x.PathPhotoBig, x.UserId)).ToList();

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<List<PhotoNoteDTO>>(success: true, photos);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), dbFiles));
                }
            }

            return new OperationResult<List<PhotoNoteDTO>>().SetNoPermissions();
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
                    throw new Exception("Content not found");
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

                    var result = new PhotosCollectionNoteDTO(null, photosCollection.Width, photosCollection.Height,
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
    }
}
