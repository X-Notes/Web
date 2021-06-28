using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Users;

namespace Common.DTO.Permissions
{
    public class UserPermissionsForFolder
    {
        public User User { set; get; }
        public Folder Folder { set; get; }
        public bool CanRead { set; get; }
        public bool CanWrite { set; get; }
        public bool UserNotFound { set; get; }
        public bool FolderNotFound { set; get; }
        public bool IsOwner { set; get; }
        public UserPermissionsForFolder GetFullAccess(User user, Folder folder, bool isOwner)
        {
            User = user;
            Folder = folder;
            CanRead = true;
            CanWrite = true;
            IsOwner = isOwner;
            return this;
        }
        public UserPermissionsForFolder GetOnlyRead(User user, Folder folder)
        {
            User = user;
            Folder = folder;
            CanRead = true;
            CanWrite = false;
            return this;
        }

        public UserPermissionsForFolder NoAccessRights(User user, Folder folder)
        {
            User = user;
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
