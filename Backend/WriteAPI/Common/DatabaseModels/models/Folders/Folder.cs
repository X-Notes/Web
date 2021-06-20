using Common.DatabaseModels.models.Systems;
using Common.DatabaseModels.models.Users;
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.models.Folders
{
    public class Folder : BaseEntity<Guid>
    {
        public FolderTypeENUM FolderTypeId { set; get; }
        public FolderType FolderType { set; get; }

        public RefTypeENUM RefTypeId { set; get; }
        public RefType RefType { set; get; }

        public string Title { set; get; }
        public string Color { set; get; }
        public int Order { set; get; }
        public Guid UserId { set; get; }
        public User User { set; get; }
        public DateTimeOffset DeletedAt { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }
        public List<FoldersNotes> FoldersNotes { set; get; }
        public List<UsersOnPrivateFolders> UsersOnPrivateFolders { set; get; }
    }
}
