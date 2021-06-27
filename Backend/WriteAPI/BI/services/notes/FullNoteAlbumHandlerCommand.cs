using BI.helpers;
using BI.services.history;
using BI.signalR;
using Common.DatabaseModels.models.NoteContent;
using Common.DTO.notes.FullNoteContent;
using Domain.Commands.files;
using Domain.Commands.noteInner.fileContent.albums;
using Domain.Queries.permissions;
using FacadeML;
using MediatR;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;
using WriteContext.Repositories.NoteContent;

namespace BI.services.notes
{
    public class FullNoteAlbumHandlerCommand:
        IRequestHandler<InsertAlbumToNoteCommand, OperationResult<AlbumNoteDTO>>,
        IRequestHandler<RemoveAlbumCommand, OperationResult<Unit>>,
        IRequestHandler<UploadPhotosToAlbumCommand, OperationResult<List<Guid>>>,
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
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhere(x => x.NoteId == note.Id);

                var contentForRemove = contents.First(x => x.Id == request.ContentId);

                // FILES LOGIC 
                var filebytes = await request.Photos.GetFilesBytesAsync();
                var fileList = await _mediator.Send(new SavePhotosToNoteCommand(permissions.User.Id, filebytes, note.Id));

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
                    await baseNoteContentRepository.Remove(contentForRemove);

                    await fileRepository.AddRange(dbFiles);

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

                    await albumNoteRepository.Add(albumNote);

                    await transaction.CommitAsync();

                    var resultPhotos = albumNote.Photos.Select(x => new AlbumPhotoDTO(x.Id, x.Name, x.PathPhotoSmall, x.PathPhotoMedium, x.PathPhotoBig)).ToList();
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
                    var pathes = dbFiles.SelectMany(x => x.GetNotNullPathes()).ToList();
                    await _mediator.Send(new RemoveFilesByPathesCommand(permissions.User.Id.ToString(), pathes));
                }
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return new OperationResult<AlbumNoteDTO>(Success: false, null);
        }

        public async Task<OperationResult<Unit>> Handle(RemoveAlbumCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {

                var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrdered(note.Id);
                var contentForRemove = contents.FirstOrDefault(x => x.Id == request.ContentId) as AlbumNote;
                contents.Remove(contentForRemove);

                var orders = Enumerable.Range(1, contents.Count);
                contents = contents.Zip(orders, (content, order) => {
                    content.Order = order;
                    content.UpdatedAt = DateTimeOffset.Now;
                    return content;
                }).ToList();


                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForRemove);
                    await baseNoteContentRepository.UpdateRange(contents);
                    await fileRepository.RemoveRange(contentForRemove.Photos);

                    await transaction.CommitAsync();

                    var pathes = contentForRemove.Photos.SelectMany(x => x.GetNotNullPathes()).ToList();
                    await _mediator.Send(new RemoveFilesByPathesCommand(permissions.User.Id.ToString(), pathes));

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
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var album = await this.baseNoteContentRepository.GetContentById<AlbumNote>(request.ContentId);
                album.CountInRow = request.Count;
                album.UpdatedAt = DateTimeOffset.Now;
                await baseNoteContentRepository.Update(album);
                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);
                return new OperationResult<Unit>(Success: true, Unit.Value);
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(ChangeAlbumSizeCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var album = await this.baseNoteContentRepository.GetContentById<AlbumNote>(request.ContentId);
                album.Height = request.Height;
                album.Width = request.Width;
                album.UpdatedAt = DateTimeOffset.Now;
                await baseNoteContentRepository.Update(album);
                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);
                return new OperationResult<Unit>(Success: true, Unit.Value);
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(RemovePhotoFromAlbumCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var album = await this.baseNoteContentRepository.GetContentById<AlbumNote>(request.ContentId);
                var photoForRemove = album.Photos.First(x => x.Id == request.PhotoId);
                album.Photos.Remove(photoForRemove);
                album.UpdatedAt = DateTimeOffset.Now;

                if (album.Photos.Count == 0)
                {
                    var resp = await _mediator.Send(new RemoveAlbumCommand(note.Id, album.Id, request.Email));

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    return new OperationResult<Unit>(Success: true, Unit.Value);
                }
                else
                {
                    using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                    try
                    {
                        await baseNoteContentRepository.Update(album);
                        await fileRepository.Remove(photoForRemove);

                        await transaction.CommitAsync();

                        var filesForRemove = photoForRemove.GetNotNullPathes().ToList();
                        await _mediator.Send(new RemoveFilesByPathesCommand(permissions.User.Id.ToString(), filesForRemove));

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
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }


        public async Task<OperationResult<List<Guid>>> Handle(UploadPhotosToAlbumCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var album = await this.baseNoteContentRepository.GetContentById<AlbumNote>(request.ContentId);

                var filebytes = await request.Photos.GetFilesBytesAsync();
                var fileList = await this._mediator.Send(new SavePhotosToNoteCommand(permissions.User.Id, filebytes, note.Id));

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
                    await fileRepository.AddRange(dbFiles);

                    album.Photos.AddRange(dbFiles);
                    album.UpdatedAt = DateTimeOffset.Now;

                    await albumNoteRepository.Update(album);

                    await transaction.CommitAsync();

                    var photosIds = dbFiles.Select(x => x.Id).ToList();

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<List<Guid>>(Success: true, photosIds);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    var pathes = dbFiles.SelectMany(x => x.GetNotNullPathes()).ToList();
                    await _mediator.Send(new RemoveFilesByPathesCommand(permissions.User.Id.ToString(), pathes));
                }
            }

            return new OperationResult<List<Guid>>(Success: false, null);
        }

    }
}
