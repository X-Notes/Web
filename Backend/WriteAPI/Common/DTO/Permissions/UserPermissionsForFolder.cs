using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Users;
using System.Linq;

namespace Common.DTO.Permissions
{
    public class UserPermissionsForFolder
    {
        public User Author
        {
            get
            {
                return Folder.User;
            }
        }

        public User Caller { set; get; }

        public Folder Folder { set; get; }

        public bool CanRead { set; get; }

        public bool CanWrite { set; get; }

        public bool UserNotFound { set; get; }

        public bool FolderNotFound { set; get; }

        public bool IsOwner
        {
            get
            {
                return Caller?.Id == Folder.UserId;
            }

        }

        public bool IsMultiplyUpdate
        {
            get
            {
                return Folder.IsShared() || Folder.UsersOnPrivateFolders.Any();
            }
        }

        public UserPermissionsForFolder GetFullAccess(User user, Folder folder)
        {
            Caller = user;
            Folder = folder;
            CanRead = true;
            CanWrite = true;
            return this;
        }
        public UserPermissionsForFolder GetOnlyRead(User user, Folder folder)
        {
            Caller = user;
            Folder = folder;
            CanRead = true;
            CanWrite = false;
            return this;
        }

        public UserPermissionsForFolder NoAccessRights(User user, Folder folder)
        {
            Caller = user;
            Folder = folder;
            CanRead = false;
            CanWrite = false;
            return this;
        }

        public UserPermissionsForFolder GetUserNotFounded()
        {
            UserNotFound = true;
            return this;
        }

        public UserPermissionsForFolder GetFolderNotFounded()
        {
            FolderNotFound = true;
            return this;
        }
    }
}
