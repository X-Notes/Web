using Common;
using Common.DatabaseModels.Models.Users.Notifications;
using Common.DTO.Notifications;
using MediatR;
using Noots.DatabaseContext.Repositories.Notifications;
using Noots.Mapper.Mapping;
using Noots.SignalrUpdater.Impl;

namespace Noots.Notifications.Services;

public class NotificationService
{
    private readonly NotificationRepository notificationRepository;
    private readonly AppSignalRService appSignalRHub;
    private readonly NoteFolderLabelMapper mapper;

    public NotificationService(
        NotificationRepository notificationRepository, 
        AppSignalRService appSignalRHub,
        NoteFolderLabelMapper mapper)
    {
        this.notificationRepository = notificationRepository;
        this.appSignalRHub = appSignalRHub;
        this.mapper = mapper;
    }

    public async Task AddAndSendNotification(Guid userFromId, Guid userToId, NotificationMessagesEnum key, NotificationMetadata metadata, string additionalMessage)
    {
        var notification = await AddNotificationAsync(userFromId, userToId, key, metadata, additionalMessage);
        var notificationDb = await notificationRepository.GetByIdIncludeUser(notification.Id);

        var userPhotoPath = mapper.GetUserProfilePhotoPath(notificationDb.UserFrom);
        var notificationDTO = new NotificationDTO(notificationDb, userPhotoPath);

        await appSignalRHub.SendNewNotification(userToId, notificationDTO);
    }

    public async Task<Notification> AddNotificationAsync(Guid userFromId, Guid userToId, NotificationMessagesEnum key, NotificationMetadata metadata, string additionalMessage)
    {
        var notification = new Notification()
        {
            UserFromId = userFromId,
            UserToId = userToId,
            NotificationMessagesId = key,
            Metadata = metadata,
            AdditionalMessage = additionalMessage,
            Date = DateTimeProvider.Time
        };

        await notificationRepository.AddAsync(notification);

        return notification;
    }

    public async Task AddAndSendNotificationsAsync(Guid userFromId, List<Guid> userToIds, NotificationMessagesEnum key, NotificationMetadata metadata, string additionalMessage)
    {
        var notifications = await AddNotificationsAsync(userFromId, userToIds, key, metadata, additionalMessage);
        var notificationIds = notifications.Select(x => x.Id);
        var notificationsDb = await notificationRepository.GetByIdsIncludeUser(notificationIds.ToArray());

        var notificationsDTO = notificationsDb.Select(x =>
        {
            var userPhotoPath = mapper.GetUserProfilePhotoPath(x.UserFrom);
            return new NotificationDTO(x, userPhotoPath);
        });

        foreach(var not in notificationsDTO)
        {
            await appSignalRHub.SendNewNotification(userFromId, not);
        }
    }

    public async Task<List<Notification>> AddNotificationsAsync(Guid userFromId, List<Guid> userToIds, NotificationMessagesEnum key, NotificationMetadata metadata, string additionalMessage)
    {
        var notifications = userToIds.Select(userId => new Notification()
        {
            UserFromId = userFromId,
            UserToId = userId,
            NotificationMessagesId = key,
            Metadata = metadata,
            AdditionalMessage = additionalMessage,
            Date = DateTimeProvider.Time
        });

        await notificationRepository.AddRangeAsync(notifications);

        return notifications.ToList();
    }
}
