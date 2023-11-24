using Common;
using Common.DatabaseModels.Models.Users.Notifications;
using Common.DTO.Notifications;
using Mapper.Mapping;
using Noots.DatabaseContext.Repositories.Notifications;
using Noots.SignalrUpdater.Impl;

namespace Notifications.Services;

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

    public async Task AddAndSendNotification(Guid userFromId, Guid userToId, NotificationMessagesEnum key, NotificationMetadata metadata)
    {
        var notification = await AddNotificationAsync(userFromId, userToId, key, metadata);
        var notificationDb = await notificationRepository.GetByIdIncludeUser(notification.Id);

        var userPhotoPath = mapper.GetUserProfilePhotoPath(notificationDb.UserFrom);
        var notificationDTO = new NotificationDTO(notificationDb, userPhotoPath);

        await appSignalRHub.SendNewNotification(userToId, notificationDTO);
    }

    public async Task<Notification> AddNotificationAsync(Guid userFromId, Guid userToId, NotificationMessagesEnum key, NotificationMetadata metadata)
    {
        var notification = new Notification()
        {
            UserFromId = userFromId,
            UserToId = userToId,
            NotificationMessagesId = key,
            Date = DateTimeProvider.Time
        };
        notification.UpdateMetadata(metadata);
        
        await notificationRepository.AddAsync(notification);

        return notification;
    }

    public async Task AddAndSendNotificationsAsync(Guid userFromId, IEnumerable<Guid> userToIds, NotificationMessagesEnum key, NotificationMetadata metadata)
    {
        var notifications = await AddNotificationsAsync(userFromId, userToIds, key, metadata);
        var notificationIds = notifications.Select(x => x.Id).ToList();
        var notificationsDb = await notificationRepository.GetByIdsIncludeUser(notificationIds.ToArray());

        foreach (var not in notificationsDb)
        {
            var userPhotoPath = mapper.GetUserProfilePhotoPath(not.UserFrom);
            var dtoNotifocation = new NotificationDTO(not, userPhotoPath);
            await appSignalRHub.SendNewNotification(not.UserToId, dtoNotifocation);
        }
    }

    public async Task<List<Notification>> AddNotificationsAsync(Guid userFromId, IEnumerable<Guid> userToIds, NotificationMessagesEnum key, NotificationMetadata metadata)
    {
        var notifications = userToIds.Select(userId =>
        {
            var notification = new Notification()
            {
                UserFromId = userFromId,
                UserToId = userId,
                NotificationMessagesId = key,
                Date = DateTimeProvider.Time
            };
            notification.UpdateMetadata(metadata);
            return notification;
        }).ToList();

        await notificationRepository.AddRangeAsync(notifications);

        return notifications;
    }
}
