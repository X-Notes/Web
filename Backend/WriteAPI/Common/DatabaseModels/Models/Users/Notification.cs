using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Users
{
    [Table(nameof(Notification), Schema = SchemeConfig.User)]
    public class Notification : BaseEntity<Guid>
    {
        public Guid? UserFromId { set; get; }
        public User UserFrom { set; get; }

        public Guid UserToId { set; get; }
        public User UserTo { set; get; }

        public bool IsSystemMessage { set; get; }

        public bool IsRead { set; get; }

        [Column(TypeName = "jsonb")]
        public NotificationMetaDataInformation Information { set; get; }

        public DateTimeOffset Date { set; get; }
    }
}
