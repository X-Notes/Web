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
        public string Metadata { get; set; }
        
        public NotificationMetadata GetMetadata()
        {
            if (!string.IsNullOrEmpty(Metadata))
            {
                return DbJsonConverter.DeserializeObject<NotificationMetadata>(Metadata);
            }

            return null;
        }

        public void UpdateMetadata(NotificationMetadata metadata)
        {
            Metadata = metadata != null ? DbJsonConverter.Serialize(metadata) : null;
        }
    }
}
