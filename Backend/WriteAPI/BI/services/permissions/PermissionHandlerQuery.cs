using Common.DTO.permissions;
using Common.Naming;
using Domain.Queries.permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.permissions
{
    public class PermissionHandlerQuery
        : IRequestHandler<GetUserPermissionsForNote, UserPermissionsForNote>,
          IRequestHandler<GetUserPermissionsForFolder, UserPermissionsForFolder>
    {
        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        private readonly FolderRepository folderRepository;
        public PermissionHandlerQuery(
            UserRepository userRepository,
            NoteRepository noteRepository,
            FolderRepository folderRepository)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.folderRepository = folderRepository;
        }

        public async Task<UserPermissionsForNote> Handle(GetUserPermissionsForNote request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if(user != null)
            {
                var note = await this.noteRepository.GetForUpdating(request.NoteId);

                if(note == null)
                {
                    return new UserPermissionsForNote().GetNoteNotFounded();
                }

                if (note.UserId == user.Id)
                {
                    return new UserPermissionsForNote().GetFullAccess(user, note, isOwner: true);
                }

                switch (note.NoteType.Name)
                {
                    case ModelsNaming.SharedNote:
                        {
                            switch (note.RefType.Name)
                            {
                                case ModelsNaming.Editor:
                                    {
                                        return new UserPermissionsForNote().GetFullAccess(user, note, isOwner: false);
                                    }
                                case ModelsNaming.Viewer:
                                    {
                                        return new UserPermissionsForNote().GetOnlyRead(user, note);
                                    }
                            }
                            break;
                        }
                    default:
                        {
                            var noteUser = note.UsersOnPrivateNotes.FirstOrDefault(x => x.UserId == user.Id);
                            if (noteUser != null && noteUser.AccessType.Name == ModelsNaming.Editor)
                            {
                                return new UserPermissionsForNote().GetFullAccess(user, note, isOwner: false);
                            }
                            if (noteUser != null && noteUser.AccessType.Name == ModelsNaming.Viewer)
                            {
                                return new UserPermissionsForNote().GetOnlyRead(user, note);
                            }
                            return new UserPermissionsForNote().NoAccessRights(user, note);
                        }
                }
            }
            return new UserPermissionsForNote().GetUserNotFounded();
        }

        public async Task<UserPermissionsForFolder> Handle(GetUserPermissionsForFolder request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var folder = await folderRepository.GetForUpdateTitle(request.FolderId);

                if (folder == null)
                {
                    return new UserPermissionsForFolder().GetFolderNotFounded();
                }

                if (folder.UserId == user.Id)
                {
                    return new UserPermissionsForFolder().GetFullAccess(user, folder, isOwner: true);
                }

                switch (folder.FolderType.Name)
                {
                    case ModelsNaming.SharedFolder:
                        {
                            switch (folder.RefType.Name)
                            {
                                case ModelsNaming.Editor:
                                    {
                                        return new UserPermissionsForFolder().GetFullAccess(user, folder, isOwner: false);
                                    }
                                case ModelsNaming.Viewer:
                                    {
                                        return new UserPermissionsForFolder().GetOnlyRead(user, folder);
                                    }
                            }
                            break;
                        }
                    default:
                        {
                            var folderUser = folder.UsersOnPrivateFolders.FirstOrDefault(x => x.UserId == user.Id);
                            if (folderUser != null && folderUser.AccessType.Name == ModelsNaming.Editor)
                            {
                                return new UserPermissionsForFolder().GetFullAccess(user, folder, isOwner: false);
                            }
                            if (folderUser != null && folderUser.AccessType.Name == ModelsNaming.Viewer)
                            {
                                return new UserPermissionsForFolder().GetOnlyRead(user, folder);
                            }
                            return new UserPermissionsForFolder().NoAccessRights(user, folder);
                        }
                }
            }
            return new UserPermissionsForFolder().GetUserNotFounded();
        }
    }
}
