using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Users.Notifications
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

        public NotificationMessages NotificationMessages { set; get; }
        public NotificationMessagesEnum NotificationMessagesId { set; get; }

        public string AdditionalMessage { set; get; }

        public DateTimeOffset Date { set; get; }

        [Column(TypeName = "jsonb")]
        public NotificationMetadata Metadata { get; set; }
    }
}
