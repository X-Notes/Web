using Common.DatabaseModels.models;
using Common.Naming;
using Domain.Commands.share.folders;
using Domain.Commands.share.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.sharing
{
    public class SharingHandlerCommand :
        IRequestHandler<ChangeRefTypeFolders, Unit>,
        IRequestHandler<ChangeRefTypeNotes, Unit>,
        IRequestHandler<PermissionUserOnPrivateFolders, Unit>,
        IRequestHandler<RemoveUserFromPrivateFolders, Unit>,
        IRequestHandler<SendInvitesToUsersFolders, Unit>,
        IRequestHandler<SendInvitesToUsersNotes, Unit>,
        IRequestHandler<RemoveUserFromPrivateNotes, Unit>,
        IRequestHandler<PermissionUserOnPrivateNotes, Unit>
    {
        private readonly FolderRepository folderRepository;
        private readonly UserRepository userRepository;
        private readonly NoteRepository noteRepository;
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
        private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;
        public SharingHandlerCommand(
            FolderRepository folderRepository, 
            UserRepository userRepository, 
            NoteRepository noteRepository,
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
            UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository)
        {
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
        }



        public async Task<Unit> Handle(ChangeRefTypeFolders request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithFolders(request.Email);
            var folder = user.Folders.Where(x => request.Id == x.Id).FirstOrDefault();

            if (folder != null)
            {
                folder.RefTypeId = request.RefTypeId;
                if (folder.FolderType.Name != ModelsNaming.SharedFolder)
                {
                    var foldersList = new List<Folder>() { folder };
                    await folderRepository.CastFolders(foldersList, user.Folders, folder.FolderTypeId, request.SharedId);
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
                note.RefTypeId = request.RefTypeId;
                if (note.NoteType.Name != ModelsNaming.SharedNote)
                {
                    var notesList = new List<Note>() { note };
                    await noteRepository.CastNotes(notesList, user.Notes, note.NoteTypeId, request.SharedId);
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

        public async Task<Unit> Handle(PermissionUserOnPrivateFolders request, CancellationToken cancellationToken)
        {
            await CheckUserPermissionForEditingFolders(request.Email, request.FolderId);

            var access = await this.usersOnPrivateFoldersRepository.GetById(request.UserId, request.FolderId);
            if(access != null)
            {
                access.AccessTypeId = request.AccessTypeId;
                await this.usersOnPrivateFoldersRepository.Update(access);
            }
            else
            {
                var perm = new UsersOnPrivateFolders()
                {
                    AccessTypeId = request.AccessTypeId,
                    FolderId = request.FolderId,
                    UserId = request.UserId
                };
                await this.usersOnPrivateFoldersRepository.Add(perm);
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(PermissionUserOnPrivateNotes request, CancellationToken cancellationToken)
        {
            await CheckUserPermissionForEditingNotes(request.Email, request.NoteId);

            var access = await this.usersOnPrivateNotesRepository.GetByUserIdandNoteId(request.UserId, request.NoteId);
            if (access != null)
            {
                access.AccessTypeId = request.AccessTypeId;
                await this.usersOnPrivateNotesRepository.Update(access);
            }
            else
            {
                var perm = new UsersOnPrivateFolders()
                {
                    AccessTypeId = request.AccessTypeId,
                    FolderId = request.NoteId,
                    UserId = request.UserId
                };
                await this.usersOnPrivateFoldersRepository.Add(perm);
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(RemoveUserFromPrivateFolders request, CancellationToken cancellationToken)
        {
            await CheckUserPermissionForEditingFolders(request.Email, request.FolderId);

            var access = await this.usersOnPrivateFoldersRepository.GetById(request.UserId, request.FolderId);
            if(access != null)
            {
                await this.usersOnPrivateFoldersRepository.Remove(access);
            }
            else
            {
                throw new Exception();
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(RemoveUserFromPrivateNotes request, CancellationToken cancellationToken)
        {
            await CheckUserPermissionForEditingNotes(request.Email, request.NoteId);

            var access = await this.usersOnPrivateNotesRepository.GetByUserIdandNoteId(request.UserId, request.NoteId);
            if (access != null)
            {
                await this.usersOnPrivateNotesRepository.Remove(access);
            }
            else
            {
                throw new Exception();
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(SendInvitesToUsersFolders request, CancellationToken cancellationToken)
        {
            await CheckUserPermissionForEditingFolders(request.Email, request.FolderId);

            var permissions = request.UserIds.Select(userId => new UsersOnPrivateFolders()
            {
                AccessTypeId = request.RefTypeId,
                FolderId = request.FolderId,
                UserId = userId
            }).ToList();

            await this.usersOnPrivateFoldersRepository.AddRange(permissions);

            return Unit.Value;
        }

        public async Task<Unit> Handle(SendInvitesToUsersNotes request, CancellationToken cancellationToken)
        {
            await CheckUserPermissionForEditingNotes(request.Email, request.NoteId);

            var permissions = request.UserIds.Select(userId => new UserOnPrivateNotes()
            {
                AccessTypeId = request.RefTypeId,
                NoteId = request.NoteId,
                UserId = userId
            }).ToList();

            await this.usersOnPrivateNotesRepository.AddRange(permissions);

            return Unit.Value;
        }



        private async Task CheckUserPermissionForEditingNotes(string email, Guid noteId)
        {
            var flag = await userRepository.IsUserNote(email, noteId);
            if(!flag)
            {
                throw new Exception("Impossible to access someone else's note");
            }
        }
        private async Task CheckUserPermissionForEditingFolders(string email, Guid folderId)
        {
            var flag = await userRepository.IsUserFolder(email, folderId);
            if (!flag)
            {
                throw new Exception("Impossible to access someone else's folder");
            }
        }
    }
}
