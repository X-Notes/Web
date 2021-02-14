using Common.DatabaseModels.helpers;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DatabaseModels.models
{
    public class UsersOnPrivateFolders
    {
        public Guid UserId { set; get; }
        public User User { set; get; }

        public Guid FolderId { set; get; }
        public Folder Folder { set; get; }
        public RefType AccessType { set; get; }
    }
}
