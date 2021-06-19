using Common.DatabaseModels.models.Systems;
using Common.DatabaseModels.models.Users;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.models.Folders
{
    public class UsersOnPrivateFolders : BaseEntity<Guid>
    {
        [NotMapped]
        public override Guid Id { set; get; }
        public Guid UserId { set; get; }
        public User User { set; get; }

        public Guid FolderId { set; get; }
        public Folder Folder { set; get; }

        public RefTypeENUM AccessTypeId { set; get; }
        public RefType AccessType { set; get; }
    }
}
