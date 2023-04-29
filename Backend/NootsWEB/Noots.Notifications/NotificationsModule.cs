using Microsoft.Extensions.DependencyInjection;
using Noots.Notifications.Services;

namespace Noots.Notifications;

public static class NotificationsModule
{
    public static void ApplyNotificationsModule(this IServiceCollection services)
    {
        services.AddScoped<NotificationService>();
    }
}
