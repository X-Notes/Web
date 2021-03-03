using BI.helpers;
using Common.DatabaseModels.models;
using Domain.Commands.noteInner;
using Domain.Queries.permissions;
using MediatR;
using Storage;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.notes
{
    public class FullNoteHandlerCommand :
        IRequestHandler<UpdateTitleNoteCommand, Unit>,
        IRequestHandler<UploadImageToNoteCommand, Unit>
    {
        private readonly NoteRepository noteRepository;
        private readonly PhotoHelpers photoHelpers;
        private readonly IFilesStorage filesStorage;
        private readonly IMediator _mediator;
        public FullNoteHandlerCommand(
                                        NoteRepository noteRepository, 
                                        PhotoHelpers photoHelpers,
                                        IFilesStorage filesStorage,
                                        IMediator _mediator)
        {
            this.noteRepository = noteRepository;
            this.photoHelpers = photoHelpers;
            this.filesStorage = filesStorage;
            this._mediator = _mediator;
        }

        public async Task<Unit> Handle(UpdateTitleNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.Id, request.Email);
            var permissions = await _mediator.Send(command);

            if(permissions.CanWrite)
            {
                var note = permissions.Note;
                note.Title = request.Title;
                await noteRepository.UpdateNote(note);
            }

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
            return Unit.Value;
        }
    }
}
