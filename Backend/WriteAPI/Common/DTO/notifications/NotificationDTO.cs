using Common.DatabaseModels.models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.notifications
{
    public class NotificationDTO
    {
        public bool IsSystemMessage { set; get; }
        public bool IsRead { set; get; }
        public string Message { set; get; }

        public NotificationDTO(Notification notification)
        {
            this.IsSystemMessage = notification.IsSystemMessage;
            this.IsRead = notification.IsRead;
            this.Message = notification.Message;
        }
    }
}
