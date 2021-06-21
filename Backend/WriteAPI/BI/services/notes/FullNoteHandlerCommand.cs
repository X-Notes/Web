using BI.Mapping;
using BI.services.history;
using BI.signalR;
using Common.DatabaseModels.models.NoteContent;
using Common.DatabaseModels.models.NoteContent.ContentParts;
using Common.DTO.notes.FullNoteContent;
using Domain.Commands.files;
using Domain.Commands.noteInner;
using Domain.Commands.noteInner.fileContent.albums;
using Domain.Commands.noteInner.fileContent.audios;
using Domain.Commands.noteInner.fileContent.files;
using Domain.Commands.noteInner.fileContent.videos;
using Domain.Queries.permissions;
using FacadeML;
using MediatR;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;

namespace BI.services.notes
{
    public class FullNoteHandlerCommand :
        IRequestHandler<UpdateTitleNoteCommand, Unit>,
        IRequestHandler<UpdateTextNoteCommand, Unit>,
        IRequestHandler<TransformTextTypeCommand, OperationResult<Unit>>,
        IRequestHandler<NewLineTextContentNoteCommand, OperationResult<TextNoteDTO>>,
        IRequestHandler<InsertLineCommand, OperationResult<TextNoteDTO>>,
        IRequestHandler<RemoveContentCommand, OperationResult<Unit>>,
        IRequestHandler<ConcatWithPreviousCommand, OperationResult<TextNoteDTO>>,
        // ALBUM
        IRequestHandler<InsertAlbumToNoteCommand, OperationResult<AlbumNoteDTO>>,
        IRequestHandler<RemoveAlbumCommand, OperationResult<Unit>>,
        IRequestHandler<UploadPhotosToAlbum, OperationResult<List<Guid>>>,
        IRequestHandler<RemovePhotoFromAlbumCommand, OperationResult<Unit>>,
        IRequestHandler<ChangeAlbumRowCountCommand, OperationResult<Unit>>,
        IRequestHandler<ChangeAlbumSizeCommand, OperationResult<Unit>>,
        // AUDIOS
        IRequestHandler<InsertAudiosToNoteCommand, OperationResult<AudioNoteDTO>>,
        // VIDEOS
        IRequestHandler<InsertVideosToNoteCommand, OperationResult<VideoNoteDTO>>,
        // FILES
        IRequestHandler<InsertFilesToNoteCommand, OperationResult<DocumentNoteDTO>>
    {
        private readonly NoteRepository noteRepository;
        private readonly IMediator _mediator;
        private readonly TextNotesRepository textNotesRepository;
        private readonly AlbumNoteRepository albumNoteRepository;
        private readonly DocumentNoteRepository documentNoteRepository;
        private readonly VideoNoteRepository videoNoteRepository;
        private readonly AudioNoteRepository audioNoteRepository;
        private readonly BaseNoteContentRepository baseNoteContentRepository;
        private readonly FileRepository fileRepository;
        private readonly OcrService ocrService;
        private readonly ObjectRecognizeService objectRecognizeService;
        private readonly HistoryCacheService historyCacheService;
        private readonly AppCustomMapper appCustomMapper;
        private readonly AppSignalRService appSignalRService;
        public FullNoteHandlerCommand(
                                        NoteRepository noteRepository,
                                        IMediator _mediator,
                                        TextNotesRepository textNotesRepository,
                                        AlbumNoteRepository albumNoteRepository,
                                        BaseNoteContentRepository baseNoteContentRepository,
                                        FileRepository fileRepository,
                                        DocumentNoteRepository documentNoteRepository,
                                        VideoNoteRepository videoNoteRepository,
                                        AudioNoteRepository audioNoteRepository,
                                        OcrService ocrService,
                                        ObjectRecognizeService objectRecognizeService,
                                        HistoryCacheService historyCacheService,
                                        AppCustomMapper appCustomMapper,
                                        AppSignalRService appSignalRService)
        {
            this.noteRepository = noteRepository;
            this._mediator = _mediator;
            this.textNotesRepository = textNotesRepository;
            this.albumNoteRepository = albumNoteRepository;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.fileRepository = fileRepository;
            this.documentNoteRepository = documentNoteRepository;
            this.videoNoteRepository = videoNoteRepository;
            this.audioNoteRepository = audioNoteRepository;
            this.ocrService = ocrService;
            this.objectRecognizeService = objectRecognizeService;
            this.historyCacheService = historyCacheService;
            this.appCustomMapper = appCustomMapper;
            this.appSignalRService = appSignalRService;
        }

        public async Task<Unit> Handle(UpdateTitleNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.Id, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var note = permissions.Note;
                note.Title = request.Title;
                note.UpdatedAt = DateTimeOffset.Now;
                await noteRepository.Update(note);
                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                var fullNote = await noteRepository.GetFull(note.Id);
                var noteForUpdating = appCustomMapper.MapNoteToFullNote(fullNote);
                await appSignalRService.UpdateGeneralFullNote(noteForUpdating);
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return Unit.Value;
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
                var fileList = await _mediator.Send(new SavePhotosToNoteCommand(permissions.User.Id, request.Photos, note.Id));

                // TODO MOVE THIS TO WORKER
                foreach(var fileitem in fileList)
                {
                    byte[] bytes;
                    if(fileitem.FileType == SavePhotosType.FormFile)
                    {
                        using var ms = new MemoryStream();
                        fileitem.IFormFile.CopyTo(ms);
                        bytes = ms.ToArray();
                    }
                    else
                    {
                        bytes = fileitem.FilesBytes.Bytes;
                    }

                    var textFromPhoto = ocrService.GetText(bytes);
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

                    var resultPhotos = albumNote.Photos.Select(x => new AlbumPhotoDTO(x.Id, x.PathPhotoSmall, x.PathPhotoMedium, x.PathPhotoBig)).ToList();
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
                    await _mediator.Send(new RemoveFilesByPathesCommand(permissions.User.Id.ToString() ,pathes));
                }
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return new OperationResult<AlbumNoteDTO>(Success: false, null);
        }

        public async Task<Unit> Handle(UpdateTextNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var content = await textNotesRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                content.Content = request.Content;
                if (request.Checked.HasValue)
                {
                    content.Checked = request.Checked.Value;
                    content.IsBold = request.IsBold ?? content.IsBold;
                    content.IsItalic = request.IsItalic ?? content.IsItalic;
                }
                content.UpdatedAt = DateTimeOffset.Now;
                await textNotesRepository.Update(content);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                // TODO DEADLOCK
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return Unit.Value;
        }

        public async Task<OperationResult<TextNoteDTO>> Handle(NewLineTextContentNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhere(x => x.NoteId == note.Id);
                var lastOrder = contents.Max(x => x.Order);

                var text = new TextNote(note.Id, NoteTextTypeENUM.Default, lastOrder + 1);


                await baseNoteContentRepository.Add(text);

                var textResult = new TextNoteDTO(text.Content, text.Id, 
                    text.NoteTextTypeId, text.HTypeId, text.Checked, text.IsBold, text.IsItalic, text.UpdatedAt);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<TextNoteDTO>(Success: true, textResult);
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return new OperationResult<TextNoteDTO>(Success: false, null);
        }

        public async Task<OperationResult<TextNoteDTO>> Handle(InsertLineCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrdered(note.Id);
                var content = contents.First(x => x.Id == request.ContentId) as TextNote;
                var insertIndex = contents.IndexOf(content);

                switch (request.LineBreakType)
                {
                    case "NEXT":
                        {
                            var newText = new TextNote(NoteId: note.Id, request.NoteTextType, content.Order + 1,
                                                        Content: request.NextText);

                            contents.Insert(insertIndex + 1, newText);

                            var orders = Enumerable.Range(1, contents.Count);
                            contents = contents.Zip(orders, (content, order) => {
                                content.Order = order;
                                return content;
                            }).ToList();

                            using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                            try
                            {
                                await textNotesRepository.Add(newText);
                                await baseNoteContentRepository.UpdateRange(contents);

                                var textResult = new TextNoteDTO(newText.Content, newText.Id, newText.NoteTextTypeId, 
                                    newText.HTypeId, newText.Checked, newText.IsBold, newText.IsItalic, newText.UpdatedAt);

                                await transaction.CommitAsync();

                                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                                return new OperationResult<TextNoteDTO>(Success: true, textResult);
                            }
                            catch (Exception e)
                            {
                                await transaction.RollbackAsync();
                                Console.WriteLine(e);
                            }
                            break;
                        }
                    case "PREV":
                        {
                            var newText = new TextNote(NoteId: note.Id, request.NoteTextType, content.Order + 1, Content: request.NextText);

                            contents.Insert(insertIndex, newText);

                            var orders = Enumerable.Range(1, contents.Count);
                            contents = contents.Zip(orders, (content, order) => {
                                content.Order = order;
                                return content;
                            }).ToList();


                            using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                            try
                            {
                                await textNotesRepository.Add(newText);
                                await baseNoteContentRepository.UpdateRange(contents);

                                var textResult = new TextNoteDTO(newText.Content, newText.Id, 
                                    newText.NoteTextTypeId, newText.HTypeId, newText.Checked, newText.IsBold, newText.IsItalic, newText.UpdatedAt);

                                await transaction.CommitAsync();

                                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                                return new OperationResult<TextNoteDTO>(Success: true, textResult);
                            }
                            catch (Exception e)
                            {
                                await transaction.RollbackAsync();
                                Console.WriteLine(e);
                            }
                            break;
                        }
                    default:
                        {
                            throw new Exception("Incorrect type");
                        }
                }
            }
            return new OperationResult<TextNoteDTO>(Success: false, null);
        }

        public async Task<OperationResult<Unit>> Handle(RemoveContentCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {

                var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrdered(note.Id);
                var contentForRemove = contents.FirstOrDefault(x => x.Id == request.ContentId);
                contents.Remove(contentForRemove);

                if (contentForRemove == null || contentForRemove.Order <= 1)
                {
                    return new OperationResult<Unit>(Success: false, Unit.Value);
                }

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

                    await transaction.CommitAsync();

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

        public async Task<OperationResult<Unit>> Handle(TransformTextTypeCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var content = await textNotesRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                if (content != null)
                {
                    content.NoteTextTypeId = request.Type;
                    content.HTypeId = request.HeadingType;
                    content.UpdatedAt = DateTimeOffset.Now;
                    await textNotesRepository.Update(content);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    // TODO DEADLOCK
                    return new OperationResult<Unit>(Success: true, Unit.Value);
                }
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }

        public async Task<OperationResult<TextNoteDTO>> Handle(ConcatWithPreviousCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await textNotesRepository.GetAllTextContentByNoteIdOrdered(note.Id);
                var contentForConcat = contents.FirstOrDefault(x => x.Id == request.ContentId);
                contents.Remove(contentForConcat);

                if (contentForConcat == null || contentForConcat.Order <= 1)
                {
                    return new OperationResult<TextNoteDTO>(Success: false, null);
                }

                var contentPrev = contents.First(x => x.Order == contentForConcat.Order - 1);
                contentPrev.Content += contentForConcat.Content;

                var orders = Enumerable.Range(1, contents.Count);

                contents = contents.Zip(orders, (content, order) => {
                    content.Order = order;
                    content.UpdatedAt = DateTimeOffset.Now;
                    return content;
                    }).ToList();

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForConcat);
                    await textNotesRepository.UpdateRange(contents);

                    await transaction.CommitAsync();

                    var textResult = new TextNoteDTO(contentPrev.Content, contentPrev.Id, 
                        contentPrev.NoteTextTypeId, contentPrev.HTypeId, contentPrev.Checked, 
                        contentPrev.IsBold, contentPrev.IsItalic, contentPrev.UpdatedAt);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<TextNoteDTO>(Success: true, textResult);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
            }

            return new OperationResult<TextNoteDTO>(Success: false, null);
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

                var photosIds = contentForRemove.Photos.Select(x => x.Id);

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

        public async Task<OperationResult<List<Guid>>> Handle(UploadPhotosToAlbum request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var album = await this.baseNoteContentRepository.GetContentById<AlbumNote>(request.ContentId);
                var fileList = await this._mediator.Send(new SavePhotosToNoteCommand(permissions.User.Id, request.Photos, note.Id));

                foreach (var fileitem in fileList)
                {
                    byte[] bytes;
                    if (fileitem.FileType == SavePhotosType.FormFile)
                    {
                        using var ms = new MemoryStream();
                        fileitem.IFormFile.CopyTo(ms);
                        bytes = ms.ToArray();
                    }
                    else
                    {
                        bytes = fileitem.FilesBytes.Bytes;
                    }

                    var textFromPhoto = ocrService.GetText(bytes);
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

        public async Task<OperationResult<AudioNoteDTO>> Handle(InsertAudiosToNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhere(x => x.NoteId == note.Id);

                var contentForRemove = contents.First(x => x.Id == request.ContentId);

                // FILES LOGIC
                var file = await _mediator.Send(new SaveAudiosToNoteCommand(permissions.User.Id, request.Audio, note.Id));

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForRemove);

                    await fileRepository.Add(file);

                    var audioNote = new AudioNote()
                    {
                        AppFileId = file.Id,
                        Name = request.Audio.FileName,
                        Note = note,
                        Order = contentForRemove.Order,
                    };

                    await audioNoteRepository.Add(audioNote);

                    await transaction.CommitAsync();

                    var result = new AudioNoteDTO(
                        audioNote.Name, audioNote.AppFileId, file.PathNonPhotoContent, audioNote.Id, audioNote.UpdatedAt);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<AudioNoteDTO>(Success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    var pathes = new List<string> { file.PathNonPhotoContent };
                    await _mediator.Send(new RemoveFilesByPathesCommand(permissions.User.Id.ToString(), pathes));
                }
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return new OperationResult<AudioNoteDTO>(Success: false, null);
        }

        public async Task<OperationResult<VideoNoteDTO>> Handle(InsertVideosToNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhere(x => x.NoteId == note.Id);

                var contentForRemove = contents.First(x => x.Id == request.ContentId);

                // FILES LOGIC
                var file = await _mediator.Send(new SaveVideosToNoteCommand(permissions.User.Id, request.Video, note.Id));

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForRemove);

                    await fileRepository.Add(file);

                    var videoNote = new VideoNote()
                    {
                        AppFileId = file.Id,
                        Name = request.Video.FileName,
                        Note = note,
                        Order = contentForRemove.Order,
                    };

                    await videoNoteRepository.Add(videoNote);

                    await transaction.CommitAsync();

                    var result = new VideoNoteDTO(videoNote.Name, videoNote.AppFileId, file.PathNonPhotoContent, videoNote.Id, videoNote.UpdatedAt);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<VideoNoteDTO>(Success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    var pathes = new List<string> { file.PathNonPhotoContent };
                    await _mediator.Send(new RemoveFilesByPathesCommand(permissions.User.Id.ToString(), pathes));
                }
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return new OperationResult<VideoNoteDTO>(Success: false, null);
        }

        public async Task<OperationResult<DocumentNoteDTO>> Handle(InsertFilesToNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhere(x => x.NoteId == note.Id);

                var contentForRemove = contents.First(x => x.Id == request.ContentId);

                // FILES LOGIC
                var file = await _mediator.Send(new SaveDocumentsToNoteCommand(permissions.User.Id, request.File, note.Id));

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForRemove);

                    await fileRepository.Add(file);

                    var documentNote = new DocumentNote()
                    {
                        AppFileId = file.Id,
                        Name = request.File.FileName,
                        Note = note,
                        Order = contentForRemove.Order,
                    };

                    await documentNoteRepository.Add(documentNote);

                    await transaction.CommitAsync();

                    var result = new DocumentNoteDTO(documentNote.Name, file.PathNonPhotoContent, documentNote.AppFileId, documentNote.Id, documentNote.UpdatedAt);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<DocumentNoteDTO>(Success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    var pathes = new List<string> { file.PathNonPhotoContent };
                    await _mediator.Send(new RemoveFilesByPathesCommand(permissions.User.Id.ToString(), pathes));
                }
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return new OperationResult<DocumentNoteDTO>(Success: false, null);
        }
    }
}
