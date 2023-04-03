using Common.DatabaseModels.Models.Users;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.WS
{
    [Table(nameof(UserIdentifierConnectionId), Schema = SchemeConfig.WS)]
    public class UserIdentifierConnectionId : BaseEntity<Guid>
    {
        override public Guid Id { set; get; }

        public Guid? UserId { set; get; }
        public User User { set; get; }

        public Guid? UnauthorizedId { set; get; }

        [Required(AllowEmptyStrings = false)]
        public string ConnectionId { set; get; }

        public string UserAgent { get; set; }

        public DateTimeOffset UpdatedAt { set; get; }

        public DateTimeOffset ConnectedAt { set; get; }

        public List<FolderConnection> FolderConnections { set; get; }

        public List<NoteConnection> NoteConnections { set; get; }

        public Guid GetUserId()
        {
            var id = UserId ?? UnauthorizedId;
            return id.Value;
        }
    }
}
