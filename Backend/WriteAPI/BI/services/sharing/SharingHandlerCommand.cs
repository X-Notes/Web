using Common.DatabaseModels.helpers;
using Common.DatabaseModels.models;
using Domain.Commands.share.folders;
using Domain.Commands.share.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.sharing
{
    public class SharingHandlerCommand :
        IRequestHandler<ChangeRefTypeFolders, Unit>,
        IRequestHandler<ChangeRefTypeNotes, Unit>
    {
        private readonly FolderRepository folderRepository;
        private readonly UserRepository userRepository;
        private readonly NoteRepository noteRepository;
        public SharingHandlerCommand(FolderRepository folderRepository, UserRepository userRepository, NoteRepository noteRepository)
        {
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
        }



        public async Task<Unit> Handle(ChangeRefTypeFolders request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithFolders(request.Email);
            var folder = user.Folders.Where(x => request.Id == x.Id).FirstOrDefault();

            if (folder != null)
            {
                folder.RefType = request.RefType;
                if (folder.FolderType != FoldersType.Shared)
                {
                    var foldersList = new List<Folder>() { folder };
                    await folderRepository.CastFolders(foldersList, user.Folders, folder.FolderType, FoldersType.Shared);
                }
                else
                {
                    await folderRepository.UpdateFolder(folder);
                }
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(ChangeRefTypeNotes request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotes(request.Email);
            var note = user.Notes.Where(x => request.Id == x.Id).FirstOrDefault();

            if (note != null)
            {
                note.RefType = request.RefType;
                if (note.NoteType != NotesType.Shared)
                {
                    var notesList = new List<Note>() { note };
                    await noteRepository.CastNotes(notesList, user.Notes, note.NoteType, NotesType.Shared);
                }
                else
                {
                    await noteRepository.UpdateNote(note);
                }
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }
    }
}
