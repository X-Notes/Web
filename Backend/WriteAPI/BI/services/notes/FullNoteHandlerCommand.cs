using BI.helpers;
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
                if(content != null)
                {
                    content.Content = request.Content;
                    await textNotesRepository.Update(content);
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

                var maxOrder = contents.Max(x => x.Order);
                var newOrder = maxOrder + 1;

                var textType = TextNoteTypesDictionary.GetValueFromDictionary(TextNoteTypes.DEFAULT);
                var text = new TextNote(textType, newOrder, note.Id);

                await textNotesRepository.Add(text);

                var textResult = new TextNoteDTO(text.Content, text.Id, text.Order, text.TextType, text.HeadingType, text.Checked);
                return new TextOperationResult<TextNoteDTO>(Success: true, textResult);
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
                var content = contents.First(x => x.Id == request.ContentId);

                switch(request.LineBreakType)
                {
                    case "NEXT":
                        {
                            var newOrder = content.Order + 1;

                            var contentsForUpdate = contents.Where(x => x.Order > content.Order).ToList();
                            contentsForUpdate.ForEach(x => x.Order = x.Order + 1);

                            var textType = TextNoteTypesDictionary.GetValueFromDictionary(TextNoteTypes.DEFAULT);
                            var text = new TextNote(textType, newOrder, note.Id, request.NextText);

                            await textNotesRepository.Add(text);
                            await baseNoteContentRepository.UpdateRange(contentsForUpdate);

                            var textResult = new TextNoteDTO(text.Content, text.Id, text.Order, text.TextType, text.HeadingType, text.Checked);
                            return new TextOperationResult<TextNoteDTO>(Success: true, textResult);
                        }
                    case "PREV":
                        {
                            var newOrder = content.Order;

                            var contentsForUpdate = contents.Where(x => x.Order >= content.Order).ToList();
                            contentsForUpdate.ForEach(x => x.Order = x.Order + 1);

                            var textType = TextNoteTypesDictionary.GetValueFromDictionary(TextNoteTypes.DEFAULT);
                            var text = new TextNote(textType, newOrder, note.Id);

                            await textNotesRepository.Add(text);
                            await baseNoteContentRepository.UpdateRange(contentsForUpdate);

                            var textResult = new TextNoteDTO(text.Content, text.Id, text.Order, text.TextType, text.HeadingType, text.Checked);
                            return new TextOperationResult<TextNoteDTO>(Success: true, textResult);
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

                if (contentForRemove == null || contentForRemove.Order == 1)
                {
                    return new TextOperationResult<Unit>(Success: false, Unit.Value);
                }

                var contentForOrderUpdate = contents.Where(x => x.Order > contentForRemove.Order).ToList();
                contentForOrderUpdate.ForEach(x => x.Order = x.Order - 1);

                await baseNoteContentRepository.UpdateRange(contentForOrderUpdate);
                await baseNoteContentRepository.Remove(contentForRemove);

                return new TextOperationResult<Unit>(Success: true, Unit.Value);
            }

            return new TextOperationResult<Unit>(Success: false, Unit.Value);
        }
    }
}
