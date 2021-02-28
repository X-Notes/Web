using BI.helpers;
using Common.DatabaseModels.models;
using Common.Naming;
using Domain.Commands.noteInner;
using MediatR;
using Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.notes
{
    public class FullNoteHandlerCommand :
        IRequestHandler<UpdateTitleNoteCommand, Unit>,
        IRequestHandler<UploadImageToNoteCommand, Unit>
    {
        private readonly UserRepository userRepository;
        private readonly NoteRepository noteRepository;
        private readonly PhotoHelpers photoHelpers;
        private readonly IFilesStorage filesStorage;
        public FullNoteHandlerCommand(UserRepository userRepository, 
                                        NoteRepository noteRepository, 
                                        PhotoHelpers photoHelpers,
                                        IFilesStorage filesStorage)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.photoHelpers = photoHelpers;
            this.filesStorage = filesStorage;
        }

        public async Task<Unit> Handle(UpdateTitleNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var note = await this.noteRepository.GetForUpdating(request.Id);
                switch (note.NoteType.Name)
                {
                    case ModelsNaming.SharedNote:
                        {
                            switch (note.RefType.Name)
                            {
                                case ModelsNaming.Editor:
                                    {
                                        throw new Exception("No implimented");
                                    }
                                case ModelsNaming.Viewer:
                                    {
                                        throw new Exception("No implimented");
                                    }
                            }
                            break;
                        }
                    default:
                        {
                            if (note.UserId == user.Id)
                            {
                                note.Title = request.Title;
                                await noteRepository.UpdateNote(note);
                            }
                            else
                            {
                                var noteUser = note.UsersOnPrivateNotes.FirstOrDefault(x => x.UserId == user.Id);
                                if (noteUser != null && noteUser.AccessType.Name == ModelsNaming.Editor)
                                {
                                    note.Title = request.Title;
                                    await noteRepository.UpdateNote(note);
                                }
                                else
                                {
                                    throw new Exception("No access rights");
                                }
                            }
                            break;
                        }
                }
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(UploadImageToNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var note = await this.noteRepository.GetForUpdating(request.NoteId);
                switch (note.NoteType.Name)
                {
                    case ModelsNaming.SharedNote:
                        {
                            switch (note.RefType.Name)
                            {
                                case ModelsNaming.Editor:
                                    {
                                        throw new Exception("No implimented");
                                    }
                                case ModelsNaming.Viewer:
                                    {
                                        throw new Exception("No implimented");
                                    }
                            }
                            break;
                        }
                    default:
                        {
                            if (note.UserId == user.Id)
                            {
                                // TODO

                                var fileList = new List<AppFile>();
                                foreach(var file in request.Photos)
                                {
                                    var photoType = photoHelpers.GetPhotoType(file);
                                    var getContentString = filesStorage.GetValueFromDictionary(ContentTypes.Images);
                                    var pathToCreatedFile = await filesStorage.SaveNoteFiles(file, note.Id, getContentString, photoType);
                                    var fileDB = new AppFile { Path = pathToCreatedFile, Type = file.ContentType };
                                    fileList.Add(fileDB);
                                }

                                var success = await noteRepository.AddAlbum(fileList, note);

                                if (!success)
                                {
                                    foreach(var file in fileList)
                                    {
                                        filesStorage.RemoveFile(file.Path);
                                    }
                                    // return null; TODO
                                }

                            }
                            else
                            {
                                var noteUser = note.UsersOnPrivateNotes.FirstOrDefault(x => x.UserId == user.Id);
                                if (noteUser != null && noteUser.AccessType.Name == ModelsNaming.Editor)
                                {
                                    throw new Exception("No implimented");
                                }
                                else
                                {
                                    throw new Exception("No access rights");
                                }
                            }
                            break;
                        }
                }
            }
            return Unit.Value;
        }
    }
}
