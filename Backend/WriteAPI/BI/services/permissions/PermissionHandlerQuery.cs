using Common.DatabaseModels.models.Folders;
using Common.DatabaseModels.models.Notes;
using Common.DatabaseModels.models.Systems;
using Common.DTO.permissions;
using Domain.Queries.permissions;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Users;

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
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            if (user != null)
            {
                var note = await this.noteRepository.GetForCheckPermission(request.NoteId);

                if(note == null)
                {
                    return new UserPermissionsForNote().SetNoteNotFounded();
                }

                if (note.UserId == user.Id)
                {
                    return new UserPermissionsForNote().SetFullAccess(user, note, isOwner: true);
                }

                switch (note.NoteTypeId)
                {
                    case NoteTypeENUM.Shared:
                        {
                            switch (note.RefTypeId)
                            {
                                case RefTypeENUM.Editor:
                                    {
                                        return new UserPermissionsForNote().SetFullAccess(user, note, isOwner: false);
                                    }
                                case RefTypeENUM.Viewer:
                                    {
                                        return new UserPermissionsForNote().SetOnlyRead(user, note);
                                    }
                            }
                            break;
                        }
                    default:
                        {
                            var noteUser = note.UsersOnPrivateNotes.FirstOrDefault(x => x.UserId == user.Id);
                            if (noteUser != null && noteUser.AccessTypeId == RefTypeENUM.Editor)
                            {
                                return new UserPermissionsForNote().SetFullAccess(user, note, isOwner: false);
                            }
                            if (noteUser != null && noteUser.AccessTypeId == RefTypeENUM.Viewer)
                            {
                                return new UserPermissionsForNote().SetOnlyRead(user, note);
                            }
                            return new UserPermissionsForNote().SetNoAccessRights(user, note);
                        }
                }
            }
            return new UserPermissionsForNote().SetUserNotFounded();
        }

        public async Task<UserPermissionsForFolder> Handle(GetUserPermissionsForFolder request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
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

                switch (folder.FolderTypeId)
                {
                    case FolderTypeENUM.Shared:
                        {
                            switch (folder.RefTypeId)
                            {
                                case RefTypeENUM.Editor:
                                    {
                                        return new UserPermissionsForFolder().GetFullAccess(user, folder, isOwner: false);
                                    }
                                case RefTypeENUM.Viewer:
                                    {
                                        return new UserPermissionsForFolder().GetOnlyRead(user, folder);
                                    }
                            }
                            break;
                        }
                    default:
                        {
                            var folderUser = folder.UsersOnPrivateFolders.FirstOrDefault(x => x.UserId == user.Id);
                            if (folderUser != null && folderUser.AccessTypeId == RefTypeENUM.Editor)
                            {
                                return new UserPermissionsForFolder().GetFullAccess(user, folder, isOwner: false);
                            }
                            if (folderUser != null && folderUser.AccessTypeId == RefTypeENUM.Viewer)
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
