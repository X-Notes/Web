﻿using System;
using Common.DatabaseModels.Models.Users.Notifications;

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

        public NotificationMessagesEnum NotificationMessagesId { set; get; }

        public string AdditionalMessage { set; get; }

        public NotificationMetadata Metadata { set; get; }

        public DateTimeOffset Date { set; get; }

        public NotificationDTO(Notification notification, string userPhotoPath)
        {
            this.Id = notification.Id;

            this.IsSystemMessage = notification.IsSystemMessage;
            this.IsRead = notification.IsRead;
            
            this.NotificationMessagesId = notification.NotificationMessagesId;
            this.AdditionalMessage = notification.AdditionalMessage;
            this.Metadata = notification.GetMetadata();

            this.UserFromId = notification.UserFrom.Id;
            this.UserFromName = notification.UserFrom.Name;
            this.UserFromPhotoPath = userPhotoPath;

            this.Date = notification.Date;
        }
    }
}
