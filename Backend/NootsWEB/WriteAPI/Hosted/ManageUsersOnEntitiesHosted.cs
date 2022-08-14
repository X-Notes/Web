using BI.SignalR;
using Common;
using Microsoft.Extensions.Hosting;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using WriteAPI.Models;

namespace WriteAPI.Hosted
{
    public class ManageUsersOnEntitiesHosted : BackgroundService
    {
        private readonly WebsocketsFoldersServiceStorage websocketsFoldersService;

        private readonly WebsocketsNotesServiceStorage websocketsNotesService;

        private readonly TimersConfig timersConfig;

        public ManageUsersOnEntitiesHosted(
            WebsocketsFoldersServiceStorage websocketsFoldersService, 
            WebsocketsNotesServiceStorage websocketsNotesService,
            TimersConfig timersConfig)
        {
            this.websocketsFoldersService = websocketsFoldersService;
            this.websocketsNotesService = websocketsNotesService;
            this.timersConfig = timersConfig;
        }

        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var earliestTimestamp = DateTimeProvider.Time.AddHours(-timersConfig.ManageUsersOnEntitiesDeleteAfterHourse);

            while (!stoppingToken.IsCancellationRequested)
            {
                Debug.WriteLine("Start ManageUsersOnEntitiesHosted");

                websocketsFoldersService.ClearEmptyAfterDelay(earliestTimestamp);
                websocketsNotesService.ClearEmptyAfterDelay(earliestTimestamp);

                await Task.Delay(timersConfig.ManageUsersOnEntitiesCallClearSeconds * 1000, stoppingToken);
            }
        }
    }
}
