using BI.helpers;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.NoteContent;
using Common.DatabaseModels.models.NoteContent.NoteDict;
using Common.DTO.notes.FullNoteContent;
using Common.DTO.notes.FullNoteContent.NoteContentTypeDict;
using Domain.Commands.files;
using Domain.Commands.noteInner;
using Domain.Queries.permissions;
using MediatR;
using Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.notes
{
    public class FullNoteHandlerCommand :
        IRequestHandler<UpdateTitleNoteCommand, Unit>,
        IRequestHandler<InsertAlbumToNoteCommand, OperationResult<AlbumNoteDTO>>,
        IRequestHandler<UpdateTextNoteCommand, Unit>,
        IRequestHandler<TransformTextTypeCommand, OperationResult<Unit>>,
        IRequestHandler<NewLineTextContentNoteCommand, OperationResult<TextNoteDTO>>,
        IRequestHandler<InsertLineCommand, OperationResult<TextNoteDTO>>,
        IRequestHandler<RemoveContentCommand, OperationResult<Unit>>,
        IRequestHandler<ConcatWithPreviousCommand, OperationResult<TextNoteDTO>>,
        // ALBUM
        IRequestHandler<RemoveAlbumCommand, OperationResult<Unit>>,
        IRequestHandler<UploadPhotosToAlbum, OperationResult<List<Guid>>>,
        IRequestHandler<RemovePhotoFromAlbumCommand, OperationResult<Unit>>,
        IRequestHandler<ChangeAlbumRowCountCommand, OperationResult<Unit>>,
        IRequestHandler<ChangeAlbumSizeCommand, OperationResult<Unit>>
    {
        private readonly NoteRepository noteRepository;
        private readonly IMediator _mediator;
        private readonly TextNotesRepository textNotesRepository;
        private readonly AlbumNoteRepository albumNoteRepository;
        private readonly BaseNoteContentRepository baseNoteContentRepository;
        private readonly FileRepository fileRepository;
        public FullNoteHandlerCommand(
                                        NoteRepository noteRepository,
                                        IMediator _mediator,
                                        TextNotesRepository textNotesRepository,
                                        AlbumNoteRepository albumNoteRepository,
                                        BaseNoteContentRepository baseNoteContentRepository,
                                        FileRepository fileRepository)
        {
            this.noteRepository = noteRepository;
            this._mediator = _mediator;
            this.textNotesRepository = textNotesRepository;
            this.albumNoteRepository = albumNoteRepository;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.fileRepository = fileRepository;
        }

        public async Task<Unit> Handle(UpdateTitleNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.Id, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var note = permissions.Note;
                note.Title = request.Title;
                await noteRepository.Update(note);
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return Unit.Value;
        }

        public async Task<OperationResult<AlbumNoteDTO>> Handle(InsertAlbumToNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhere(x => x.NoteId == note.Id);

                var contentForRemove = contents.First(x => x.Id == request.ContentId);

                var contentPrev = contents.FirstOrDefault(x => x.Id == contentForRemove.PrevId);
                var contentNext = contents.FirstOrDefault(x => x.Id == contentForRemove.NextId);

                // FILES LOGIC
                var fileList = await _mediator.Send(new SavePhotosToNoteCommand(request.Photos, note.Id));

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForRemove);

                    await fileRepository.AddRange(fileList);

                    var albumNote = new AlbumNote()
                    {
                        Photos = fileList,
                        Note = note,
                        PrevId = contentForRemove.PrevId,
                        NextId = contentForRemove.NextId,
                        CountInRow = 2,
                        Width = "100%",
                        Height = "auto"
                    };

                    await albumNoteRepository.Add(albumNote);

                    var updateList = new List<BaseNoteContent>();
                    if (contentNext != null)
                    {
                        contentNext.PrevId = albumNote.Id;
                        updateList.Add(contentNext);
                    }
                    if (contentPrev != null)
                    {
                        contentPrev.NextId = albumNote.Id;
                        updateList.Add(contentPrev);
                    }

                    await baseNoteContentRepository.UpdateRange(updateList);

                    await transaction.CommitAsync();

                    var type = NoteContentTypeDictionary.GetValueFromDictionary(NoteContentType.ALBUM);
                    var resultPhotos = albumNote.Photos.Select(x => new AlbumPhotoDTO(x.Id)).ToList();
                    var result = new AlbumNoteDTO(resultPhotos, null, null, albumNote.Id, type, albumNote.NextId, albumNote.PrevId, albumNote.CountInRow);
                    return new OperationResult<AlbumNoteDTO>(Success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    var pathes = fileList.Select(x => x.Path).ToList();
                    await _mediator.Send(new RemoveFilesByPathesCommand(pathes));
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
                var content = await textNotesRepository.GetById(request.ContentId);
                if (content != null)
                {
                    content.Content = request.Content;
                    if (request.Checked.HasValue)
                    {
                        content.Checked = request.Checked.Value;
                    }
                    await textNotesRepository.Update(content);
                    // TODO DEADLOCK
                }
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
                var lastContent = contents.First(x => x.NextId == null);

                var textType = TextNoteTypesDictionary.GetValueFromDictionary(TextNoteTypes.DEFAULT);
                var text = new TextNote(note.Id, lastContent.Id, null, textType);

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Add(text);

                    lastContent.NextId = text.Id;

                    await baseNoteContentRepository.Update(lastContent);

                    await transaction.CommitAsync();

                    var textResult = new TextNoteDTO(text.Content, text.Id, text.TextType, text.HeadingType, text.Checked,
                                text.NextId, text.PrevId);

                    return new OperationResult<TextNoteDTO>(Success: true, textResult);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
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
                var contents = await baseNoteContentRepository.GetWhere(x => x.NoteId == note.Id);

                var content = contents.First(x => x.Id == request.ContentId) as TextNote;

                switch (request.LineBreakType)
                {
                    case "NEXT":
                        {
                            var contentNext = contents.FirstOrDefault(x => x.Id == content.NextId);

                            var textType = TextNoteTypesDictionary.GetNextTypeForInserting(content.TextType);
                            var newText = new TextNote(NoteId: note.Id, PrevId: content.Id, contentNext?.Id, textType, Content: request.NextText);

                            using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                            try
                            {
                                await textNotesRepository.Add(newText);

                                content.NextId = newText.Id;

                                var updateList = new List<BaseNoteContent>();
                                if (contentNext != null)
                                {
                                    contentNext.PrevId = newText.Id;
                                    updateList.Add(contentNext);
                                }

                                updateList.Add(content);

                                await baseNoteContentRepository.UpdateRange(updateList);

                                var textResult = new TextNoteDTO(newText.Content, newText.Id, newText.TextType, newText.HeadingType, newText.Checked,
                                                                    newText.NextId, newText.PrevId);

                                await transaction.CommitAsync();
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
                            var contentPrev = contents.FirstOrDefault(x => x.Id == content.PrevId);

                            var textType = TextNoteTypesDictionary.GetValueFromDictionary(TextNoteTypes.DEFAULT);
                            var newText = new TextNote(NoteId: note.Id, PrevId: contentPrev?.Id, NextId: content?.Id,
                                                        textType, Content: request.NextText);


                            using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                            try
                            {
                                await textNotesRepository.Add(newText);

                                var updateList = new List<BaseNoteContent>();
                                if (contentPrev != null)
                                {
                                    content.PrevId = newText.Id;
                                    contentPrev.NextId = newText.Id;
                                    updateList.Add(content);
                                    updateList.Add(contentPrev);
                                }
                                else
                                {
                                    content.PrevId = newText.Id;
                                    updateList.Add(content);
                                }

                                await baseNoteContentRepository.UpdateRange(updateList);

                                var textResult = new TextNoteDTO(newText.Content, newText.Id, newText.TextType, newText.HeadingType, newText.Checked,
                                                                    newText.NextId, newText.PrevId);

                                await transaction.CommitAsync();
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

                var contents = await baseNoteContentRepository.GetWhere(x => x.NoteId == note.Id);
                var contentForRemove = contents.FirstOrDefault(x => x.Id == request.ContentId);

                if (contentForRemove == null || contentForRemove.PrevId == null)
                {
                    return new OperationResult<Unit>(Success: false, Unit.Value);
                }

                var contentPrev = contents.First(x => x.Id == contentForRemove.PrevId);
                var contentNext = contents.FirstOrDefault(x => x.Id == contentForRemove.NextId);

                var updateList = new List<BaseNoteContent>();

                if (contentNext != null)
                {
                    contentNext.PrevId = contentPrev.Id;
                    contentPrev.NextId = contentNext.Id;
                    updateList.Add(contentNext);
                }
                else
                {
                    contentPrev.NextId = null;
                }

                updateList.Add(contentPrev);

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForRemove);
                    await baseNoteContentRepository.UpdateRange(updateList);
                    await transaction.CommitAsync();
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

            var typeIsExist = TextNoteTypesDictionary.IsExistValue(request.Type);

            if (request.HeadingType != null)
            {
                var headingIsExist = HeadingNoteTypesDictionary.IsExistValue(request.HeadingType);
                if (!headingIsExist)
                {
                    return new OperationResult<Unit>(Success: false, Unit.Value);
                }
            }

            if (!typeIsExist)
            {
                return new OperationResult<Unit>(Success: false, Unit.Value);
            }

            if (permissions.CanWrite)
            {
                var content = await textNotesRepository.GetById(request.ContentId);
                if (content != null)
                {
                    content.TextType = request.Type;
                    content.HeadingType = request.HeadingType;
                    await textNotesRepository.Update(content);
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
                var contents = await textNotesRepository.GetWhere(x => x.NoteId == note.Id);
                var contentForConcat = contents.FirstOrDefault(x => x.Id == request.ContentId);

                if (contentForConcat == null || contentForConcat.PrevId == null)
                {
                    return new OperationResult<TextNoteDTO>(Success: false, null);
                }

                var contentPrev = contents.First(x => x.Id == contentForConcat.PrevId);
                var contentNext = contents.FirstOrDefault(x => x.Id == contentForConcat.NextId);

                contentPrev.Content += contentForConcat.Content;

                var updateList = new List<BaseNoteContent>();
                if (contentNext != null)
                {
                    contentPrev.NextId = contentNext.Id;
                    contentNext.PrevId = contentPrev.Id;
                    updateList.Add(contentPrev);
                    updateList.Add(contentNext);
                }
                else
                {
                    contentPrev.NextId = null;
                    updateList.Add(contentPrev);
                }

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForConcat);
                    await baseNoteContentRepository.UpdateRange(updateList);
                    await transaction.CommitAsync();
                    var textResult = new TextNoteDTO(contentPrev.Content, contentPrev.Id, contentPrev.TextType,
                                    contentPrev.HeadingType, contentPrev.Checked,
                                    contentPrev.NextId, contentPrev.PrevId);

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

                var contents = await baseNoteContentRepository.GetAllContentByNoteId(note.Id);
                var contentForRemove = contents.FirstOrDefault(x => x.Id == request.ContentId) as AlbumNote;

                if (contentForRemove == null)
                {
                    return new OperationResult<Unit>(Success: false, Unit.Value);
                }

                if (contentForRemove.PrevId == null)
                {
                    // TODO
                    Console.WriteLine("TODO RemoveAlbumCommand PrevId == null");
                }
                else
                {
                    var contentPrev = contents.First(x => x.Id == contentForRemove.PrevId);
                    var contentNext = contents.FirstOrDefault(x => x.Id == contentForRemove.NextId);

                    var updateList = new List<BaseNoteContent>();

                    if (contentNext != null)
                    {
                        contentNext.PrevId = contentPrev.Id;
                        contentPrev.NextId = contentNext.Id;
                        updateList.Add(contentNext);
                    }
                    else
                    {
                        contentPrev.NextId = null;
                    }

                    updateList.Add(contentPrev);

                    var photosIds = contentForRemove.Photos.Select(x => x.Id);

                    using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                    try
                    {
                        await baseNoteContentRepository.Remove(contentForRemove);
                        await baseNoteContentRepository.UpdateRange(updateList);
                        await fileRepository.RemoveRange(contentForRemove.Photos);

                        await transaction.CommitAsync();

                        var pathes = contentForRemove.Photos.Select(x => x.Path).ToList();
                        await _mediator.Send(new RemoveFilesByPathesCommand(pathes));

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

        public async Task<OperationResult<List<Guid>>> Handle(UploadPhotosToAlbum request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var album = await this.baseNoteContentRepository.GetContentById<AlbumNote>(request.ContentId);
                var fileList = await this._mediator.Send(new SavePhotosToNoteCommand(request.Photos, note.Id));

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {

                    await fileRepository.AddRange(fileList);

                    album.Photos.AddRange(fileList);

                    await albumNoteRepository.Update(album);

                    await transaction.CommitAsync();

                    var photosIds = fileList.Select(x => x.Id).ToList();
                    return new OperationResult<List<Guid>>(Success: true, photosIds);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    var pathes = fileList.Select(x => x.Path).ToList();
                    await _mediator.Send(new RemoveFilesByPathesCommand(pathes));
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

                if (album.Photos.Count == 0)
                {
                    var resp = await _mediator.Send(new RemoveAlbumCommand(note.Id, album.Id, request.Email));
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

                        await _mediator.Send(new RemoveFilesByPathesCommand(new List<string> { photoForRemove.Path }));
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
                await baseNoteContentRepository.Update(album);
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
                await baseNoteContentRepository.Update(album);
                return new OperationResult<Unit>(Success: true, Unit.Value);
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }
    }
}
