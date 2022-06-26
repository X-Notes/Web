using Common.DatabaseModels.Models.Users;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.WS
{
    [Table(nameof(UserIdentifierConnectionId), Schema = SchemeConfig.WS)]
    public class UserIdentifierConnectionId : BaseEntity<Guid>
    {
        override public Guid Id { set; get; }

        public Guid? UserId { set; get; }
        public User User { set; get; }

        public string ConnectionId { set; get; }

        public DateTimeOffset ConnectedAt { set; get; }
    }
}
