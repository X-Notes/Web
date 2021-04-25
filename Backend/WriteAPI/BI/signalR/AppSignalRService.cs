using Common.DTO.notifications;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BI.signalR
{
    public class AppSignalRService
    {
        IHubContext<AppSignalRHub> context;
        public AppSignalRService(IHubContext<AppSignalRHub> context)
        {
            this.context = context;
        }

        public async Task SendNewNotification(string receiverEmail, NotificationDTO notification)
        {
            await context.Clients.User(receiverEmail).SendAsync("newNotification", notification);
        }
    }
}
