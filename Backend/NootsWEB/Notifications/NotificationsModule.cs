using Microsoft.Extensions.DependencyInjection;
using Notifications.Services;

namespace Notifications;

public static class NotificationsModule
{
    public static void ApplyNotificationsModule(this IServiceCollection services)
    {
        services.AddScoped<NotificationService>();
    }
}
