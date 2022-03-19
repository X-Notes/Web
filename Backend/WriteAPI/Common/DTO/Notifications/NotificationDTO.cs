using System;
using Common.DatabaseModels.Models.Users;

namespace Common.DTO.Notifications
{
    public class NotificationDTO
    {
        public Guid Id { set; get; }
        public bool IsSystemMessage { set; get; }

        public Guid? UserFromId { set; get; }
        public string UserFromName { set; get; }
        public string UserFromPhotoPath { set; get; }

        public bool IsRead { set; get; }

        public string TranslateKeyMessage { set; get; }

        public string AdditionalMessage { set; get; }

        public DateTimeOffset Date { set; get; }

        public NotificationDTO(Notification notification)
        {
            this.Id = notification.Id;

            this.IsSystemMessage = notification.IsSystemMessage;
            this.IsRead = notification.IsRead;
            
            this.TranslateKeyMessage = notification.TranslateKeyMessage;
            this.AdditionalMessage = notification.AdditionalMessage;

            this.UserFromId = notification.UserFrom.Id;
            this.UserFromName = notification.UserFrom.Name;
            this.UserFromPhotoPath = notification.UserFrom.UserProfilePhoto?.AppFile.GetFromSmallPath ?? notification.UserFrom.DefaultPhotoUrl;

            this.Date = Date;
        }
    }
}
