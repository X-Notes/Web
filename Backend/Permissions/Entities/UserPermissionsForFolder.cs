using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Users;

namespace Permissions.Entities
{
    public class UserPermissionsForFolder : BasePermissions
    {
        public bool FolderNotFound { private set; get; }
        
        public Guid FolderId { protected   set; get; }

        public UserPermissionsForFolder GetFullAccess(
            Guid authorId, 
            Guid callerId, 
            Guid folderId)
        {
            AuthorId = authorId;
            CallerId = callerId;
            FolderId = folderId;
            
            CanRead = true;
            CanWrite = true;
            
            return this;
        }
        
        public UserPermissionsForFolder GetOnlyRead(
            Guid authorId, 
            Guid callerId, 
            Guid folderId)
        {
            AuthorId = authorId;
            CallerId = callerId;
            FolderId = folderId;
            
            CanRead = true;
            CanWrite = false;
            
            return this;
        }

        public UserPermissionsForFolder GetNoAccessRights(
            Guid authorId, 
            Guid callerId, 
            Guid folderId)
        {
            AuthorId = authorId;
            CallerId = callerId;
            FolderId = folderId;
            
            CanRead = false;
            CanWrite = false;
            
            return this;
        }
        
        public UserPermissionsForFolder GetFolderNotFounded()
        {
            FolderNotFound = true;
            return this;
        }
    }
}
