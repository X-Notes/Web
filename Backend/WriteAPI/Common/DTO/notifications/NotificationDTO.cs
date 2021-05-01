using Common.DatabaseModels.models.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.notifications
{
    public class NotificationDTO
    {
        public Guid Id { set; get; }
        public bool IsSystemMessage { set; get; }
        public Guid? UserFromPhotoId { set; get; }
        public string UserFromName { set; get; }
        public bool IsRead { set; get; }
        public string Message { set; get; }
        public DateTimeOffset Date { set; get; }

        public NotificationDTO(Notification notification)
        {
            this.Id = notification.Id;
            this.IsSystemMessage = notification.IsSystemMessage;
            this.IsRead = notification.IsRead;
            this.Message = notification.Message;
            this.UserFromPhotoId = notification.UserFrom.PhotoId;
            this.UserFromName = notification.UserFrom.Name;
            this.Date = Date;
        }
    }
}
