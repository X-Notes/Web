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

        public NotificationMetaDataInformation Information { set; get; }

        public DateTimeOffset Date { set; get; }

        public NotificationDTO(Notification notification)
        {
            this.Id = notification.Id;

            this.IsSystemMessage = notification.IsSystemMessage;
            this.IsRead = notification.IsRead;
            this.Information = notification.Information;

            this.UserFromId = notification.UserFrom.Id;
            this.UserFromName = notification.UserFrom.Name;
            this.UserFromPhotoPath = notification.UserFrom.UserProfilePhoto.AppFile.GetFromSmallPath;

            this.Date = Date;
        }
    }
}
