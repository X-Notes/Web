using Common.DatabaseModels.models.Systems;
using Common.DatabaseModels.models.Users;
using System;

namespace Common.DatabaseModels.models.Folders
{
    public class UsersOnPrivateFolders
    {
        public Guid UserId { set; get; }
        public User User { set; get; }

        public Guid FolderId { set; get; }
        public Folder Folder { set; get; }

        public Guid AccessTypeId { set; get; }
        public RefType AccessType { set; get; }
    }
}
