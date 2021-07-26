using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Services.History;
using BI.SignalR;
using Common.DatabaseModels.Models.NoteContent;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.Files;
using Domain.Commands.NoteInner.FileContent.Albums;
using Domain.Queries.Permissions;
using FacadeML;
using MediatR;
using WriteContext.Repositories;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public class FullNoteAlbumHandlerCommand :
        IRequestHandler<InsertAlbumToNoteCommand, OperationResult<AlbumNoteDTO>>,
        IRequestHandler<RemoveAlbumCommand, OperationResult<Unit>>,
        IRequestHandler<UploadPhotosToAlbumCommand, OperationResult<List<AlbumPhotoDTO>>>,
        IRequestHandler<RemovePhotoFromAlbumCommand, OperationResult<Unit>>,
        IRequestHandler<ChangeAlbumRowCountCommand, OperationResult<Unit>>,
        IRequestHandler<ChangeAlbumSizeCommand, OperationResult<Unit>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly OcrService ocrService;

        private readonly FileRepository fileRepository;

        private readonly AlbumNoteRepository albumNoteRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        public FullNoteAlbumHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            OcrService ocrService,
            FileRepository fileRepository,
            AlbumNoteRepository albumNoteRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.ocrService = ocrService;
            this.fileRepository = fileRepository;
            this.albumNoteRepository = albumNoteRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
        }

        public string RemoveSpecialCharacters(string str) => Regex.Replace(str, "[^a-zA-Z0-9_.]+", " ", RegexOptions.Compiled);

        public async Task<OperationResult<AlbumNoteDTO>> Handle(InsertAlbumToNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhereAsync(x => x.NoteId == note.Id);

                var contentForRemove = contents.First(x => x.Id == request.ContentId);

                // FILES LOGIC 
                var filebytes = await request.Photos.GetFilesBytesAsync();
                var fileList = await _mediator.Send(new SavePhotosToNoteCommand(permissions.Author.Id, filebytes, note.Id));

                // TODO MOVE THIS TO WORKER
                foreach (var fileitem in fileList)
                {
                    var textFromPhoto = ocrService.GetText(fileitem.FilesBytes.Bytes);
                    fileitem.AppFile.TextFromPhoto = RemoveSpecialCharacters(textFromPhoto);

                    // TODO MOVE TO API
                    // var RecognizeObject = objectRecognizeService.ClassifySingleImage(fileitem.Path).GetFormatedString;
                    // fileitem.RecognizeObject = RecognizeObject;
                }

                var dbFiles = fileList.Select(x => x.AppFile).ToList();

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForRemove);

                    await fileRepository.AddRangeAsync(dbFiles);

                    var albumNote = new AlbumNote()
                    {
                        Photos = dbFiles,
                        Note = note,
                        Order = contentForRemove.Order,
                        ContentTypeId = ContentTypeENUM.Album,
                        CountInRow = 2,
                        Width = "100%",
                        Height = "auto",
                    };

                    await albumNoteRepository.AddAsync(albumNote);

                    await transaction.CommitAsync();

                    var resultPhotos = albumNote.Photos.Select(x => new AlbumPhotoDTO(x.Id, x.Name, x.PathPhotoSmall, x.PathPhotoMedium, x.PathPhotoBig, x.UserId)).ToList();
                    var result = new AlbumNoteDTO(resultPhotos, null, null,
                        albumNote.Id, albumNote.CountInRow, albumNote.UpdatedAt);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<AlbumNoteDTO>(Success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), dbFiles));
                }
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return new OperationResult<AlbumNoteDTO>(Success: false, null);
        }

        // TODO REMOVE WITHOUT ORDERING
        public async Task<OperationResult<Unit>> Handle(RemoveAlbumCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {

                var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrdered(note.Id);
                var contentForRemove = contents.FirstOrDefault(x => x.Id == request.ContentId) as AlbumNote;
                contents.Remove(contentForRemove);

                var orders = Enumerable.Range(1, contents.Count);
                contents = contents.Zip(orders, (content, order) =>
                {
                    content.Order = order;
                    content.UpdatedAt = DateTimeOffset.Now;
                    return content;
                }).ToList();


                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForRemove);
                    await baseNoteContentRepository.UpdateRangeAsync(contents);

                    await transaction.CommitAsync();

                    await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), contentForRemove.Photos));

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<Unit>(Success: true, Unit.Value);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
            }
            return new OperationResult<Unit>(Success: false, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(ChangeAlbumRowCountCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var album = await baseNoteContentRepository.GetContentById<AlbumNote>(request.ContentId);
                album.CountInRow = request.Count;
                album.UpdatedAt = DateTimeOffset.Now;
                await baseNoteContentRepository.UpdateAsync(album);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<Unit>(Success: true, Unit.Value);
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(ChangeAlbumSizeCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var album = await baseNoteContentRepository.GetContentById<AlbumNote>(request.ContentId);
                album.Height = request.Height;
                album.Width = request.Width;
                album.UpdatedAt = DateTimeOffset.Now;
                await baseNoteContentRepository.UpdateAsync(album);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<Unit>(Success: true, Unit.Value);
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(RemovePhotoFromAlbumCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var album = await baseNoteContentRepository.GetContentById<AlbumNote>(request.ContentId);
                var photoForRemove = album.Photos.First(x => x.Id == request.PhotoId);
                album.Photos.Remove(photoForRemove);
                album.UpdatedAt = DateTimeOffset.Now;

                if (album.Photos.Count == 0)
                {
                    var resp = await _mediator.Send(new RemoveAlbumCommand(note.Id, album.Id, request.Email));
                }
                else
                {
                    await baseNoteContentRepository.UpdateAsync(album);
                }

                await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), photoForRemove));

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<Unit>(Success: true, Unit.Value);
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }


        public async Task<OperationResult<List<AlbumPhotoDTO>>> Handle(UploadPhotosToAlbumCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var album = await baseNoteContentRepository.GetContentById<AlbumNote>(request.ContentId);

                var filebytes = await request.Photos.GetFilesBytesAsync();
                var fileList = await _mediator.Send(new SavePhotosToNoteCommand(permissions.Author.Id, filebytes, note.Id));

                foreach (var fileitem in fileList)
                {
                    var textFromPhoto = ocrService.GetText(fileitem.FilesBytes.Bytes);
                    fileitem.AppFile.TextFromPhoto = RemoveSpecialCharacters(textFromPhoto);
                }

                var dbFiles = fileList.Select(x => x.AppFile).ToList();

                // TODO MOVE TO API
                // fileList.ForEach(file => file.RecognizeObject = objectRecognizeService.ClassifySingleImage(file.Path).GetFormatedString);

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await fileRepository.AddRangeAsync(dbFiles);

                    album.Photos.AddRange(dbFiles);
                    album.UpdatedAt = DateTimeOffset.Now;

                    await albumNoteRepository.UpdateAsync(album);

                    await transaction.CommitAsync();

                    var photos = dbFiles.Select(x => new AlbumPhotoDTO(x.Id, x.Name, x.PathPhotoSmall, x.PathPhotoMedium, x.PathPhotoBig, x.UserId)).ToList();

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<List<AlbumPhotoDTO>>(Success: true, photos);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), dbFiles));
                }
            }

            return new OperationResult<List<AlbumPhotoDTO>>(Success: false, null);
        }

    }
}
