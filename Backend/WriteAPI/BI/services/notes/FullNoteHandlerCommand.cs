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
        IRequestHandler<NewLineTextContentNoteCommand, TextNoteDTO>
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

            if(permissions.CanWrite)
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
                content.Content = request.Content;
                await textNotesRepository.Update(content);
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return Unit.Value;
        }

        public async Task<TextNoteDTO> Handle(NewLineTextContentNoteCommand request, CancellationToken cancellationToken)
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

                return new TextNoteDTO(text.Content, text.Id, text.Order, text.TextType, text.HeadingType, text.Checked);
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return null;
        }
    }
}
