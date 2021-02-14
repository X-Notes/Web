
using Common.DatabaseModels.helpers;
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.models
{
    public class Folder
    {
        public Guid Id { get; set; }
        public FoldersType FolderType { set; get; }
        public RefType? RefType { set; get; }
        public string Title { set; get; }
        public string Color { set; get; }
        public int Order { set; get; }
        public Guid UserId { set; get; }
        public User User { set; get; }
        public DateTimeOffset DeletedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }
        public List<FoldersNotes> FoldersNotes { set; get; }
        public List<UsersOnPrivateFolders> UsersOnPrivateFolders { set; get; }
    }
}
