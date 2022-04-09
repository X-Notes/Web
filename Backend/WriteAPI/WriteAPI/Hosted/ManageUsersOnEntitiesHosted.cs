using BI.SignalR;
using Common;
using Common.Timers;
using Microsoft.Extensions.Hosting;
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

namespace WriteAPI.Hosted
{
    public class ManageUsersOnEntitiesHosted : BackgroundService
    {
        private readonly WebsocketsFoldersServiceStorage websocketsFoldersService;
        private readonly WebsocketsNotesServiceStorage websocketsNotesService;
        private readonly HostedTimersConfig hostedTimersConfig;

        public ManageUsersOnEntitiesHosted(
            WebsocketsFoldersServiceStorage websocketsFoldersService, 
            WebsocketsNotesServiceStorage websocketsNotesService,
            HostedTimersConfig hostedTimersConfig)
        {
            this.websocketsFoldersService = websocketsFoldersService;
            this.websocketsNotesService = websocketsNotesService;
            this.hostedTimersConfig = hostedTimersConfig;
        }

        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var earliestTimestamp = DateTimeProvider.Time.AddHours(-hostedTimersConfig.ManageUsersOnEntitiesDeleteAfterHourse);

            while (!stoppingToken.IsCancellationRequested)
            {
                Debug.WriteLine("Start ManageUsersOnEntitiesHosted");

                if (!websocketsNotesService.IsConsist)
                {
                    Console.WriteLine("Unconsist websockets notes");
                }

                if (!websocketsFoldersService.IsConsist)
                {
                    Console.WriteLine("Unconsist websockets folders");
                }

                websocketsFoldersService.ClearEmptyAfterDelay(earliestTimestamp);
                websocketsNotesService.ClearEmptyAfterDelay(earliestTimestamp);

                await Task.Delay(hostedTimersConfig.ManageUsersOnEntitiesCallClearSeconds * 1000, stoppingToken);
            }
        }
    }
}
