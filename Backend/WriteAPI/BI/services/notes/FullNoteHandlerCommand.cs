﻿using BI.helpers;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.NoteContent;
using Common.DatabaseModels.models.NoteContent.NoteDict;
using Common.DTO.notes.FullNoteContent;
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
        IRequestHandler<UploadImageToNoteCommand, Unit>,
        IRequestHandler<UpdateTextNoteCommand, Unit>,
        IRequestHandler<TransformTextTypeCommand, TextOperationResult<Unit>>,
        IRequestHandler<NewLineTextContentNoteCommand, TextOperationResult<TextNoteDTO>>,
        IRequestHandler<InsertLineCommand, TextOperationResult<TextNoteDTO>>,
        IRequestHandler<RemoveContentCommand, TextOperationResult<Unit>>
    {
        private readonly NoteRepository noteRepository;
        private readonly PhotoHelpers photoHelpers;
        private readonly IFilesStorage filesStorage;
        private readonly IMediator _mediator;
        private readonly TextNotesRepository textNotesRepository;
        private readonly AlbumNoteRepository albumNoteRepository;
        private readonly BaseNoteContentRepository baseNoteContentRepository;
        public FullNoteHandlerCommand(
                                        NoteRepository noteRepository,
                                        PhotoHelpers photoHelpers,
                                        IFilesStorage filesStorage,
                                        IMediator _mediator,
                                        TextNotesRepository textNotesRepository,
                                        AlbumNoteRepository albumNoteRepository,
                                        BaseNoteContentRepository baseNoteContentRepository)
        {
            this.noteRepository = noteRepository;
            this.photoHelpers = photoHelpers;
            this.filesStorage = filesStorage;
            this._mediator = _mediator;
            this.textNotesRepository = textNotesRepository;
            this.albumNoteRepository = albumNoteRepository;
            this.baseNoteContentRepository = baseNoteContentRepository;
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

        public async Task<Unit> Handle(UploadImageToNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var note = permissions.Note;
                var fileList = new List<AppFile>();
                foreach (var file in request.Photos)
                {
                    var photoType = photoHelpers.GetPhotoType(file);
                    var getContentString = filesStorage.GetValueFromDictionary(ContentTypesFile.Images);
                    var pathToCreatedFile = await filesStorage.SaveNoteFiles(file, note.Id, getContentString, photoType);
                    var fileDB = new AppFile { Path = pathToCreatedFile, Type = file.ContentType };
                    fileList.Add(fileDB);
                }

                var success = await noteRepository.AddAlbum(fileList, note);

                if (!success)
                {
                    foreach (var file in fileList)
                    {
                        filesStorage.RemoveFile(file.Path);
                    }
                }
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return Unit.Value;
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
                    await textNotesRepository.Update(content);
                    // TODO DEADLOCK
                }
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return Unit.Value;
        }

        public async Task<TextOperationResult<TextNoteDTO>> Handle(NewLineTextContentNoteCommand request, CancellationToken cancellationToken)
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

                    return new TextOperationResult<TextNoteDTO>(Success: true, textResult);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return new TextOperationResult<TextNoteDTO>(Success: false, null);
        }

        public async Task<TextOperationResult<TextNoteDTO>> Handle(InsertLineCommand request, CancellationToken cancellationToken)
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
                                return new TextOperationResult<TextNoteDTO>(Success: true, textResult);
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
                                return new TextOperationResult<TextNoteDTO>(Success: true, textResult);
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
            return new TextOperationResult<TextNoteDTO>(Success: false, null);
        }

        public async Task<TextOperationResult<Unit>> Handle(RemoveContentCommand request, CancellationToken cancellationToken)
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
                    return new TextOperationResult<Unit>(Success: false, Unit.Value);
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
                else {
                    contentPrev.NextId = null;
                }

                updateList.Add(contentPrev);

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForRemove);
                    await baseNoteContentRepository.UpdateRange(updateList);
                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }

                return new TextOperationResult<Unit>(Success: true, Unit.Value);
            }
            return new TextOperationResult<Unit>(Success: false, Unit.Value);
        }

        public async Task<TextOperationResult<Unit>> Handle(TransformTextTypeCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            var typeIsExist = TextNoteTypesDictionary.IsExistValue(request.Type);

            if(request.HeadingType != null)
            {
                var headingIsExist = HeadingNoteTypesDictionary.IsExistValue(request.HeadingType);
                if (!headingIsExist)
                {
                    return new TextOperationResult<Unit>(Success: false, Unit.Value);
                }
            }

            if (!typeIsExist)
            {
                return new TextOperationResult<Unit>(Success: false, Unit.Value);
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
                    return new TextOperationResult<Unit>(Success: true, Unit.Value);
                }
            }

            return new TextOperationResult<Unit>(Success: false, Unit.Value);
        }
    }
}
