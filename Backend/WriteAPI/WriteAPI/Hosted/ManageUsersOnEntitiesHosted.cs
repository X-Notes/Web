using BI.SignalR;
using Common;
using Microsoft.Extensions.Hosting;
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

namespace WriteAPI.Hosted
{
    public class ManageUsersOnEntitiesHosted : BackgroundService
    {
        private readonly WebsocketsFoldersService websocketsFoldersService;
        private readonly WebsocketsNotesService websocketsNotesService;

        public ManageUsersOnEntitiesHosted(WebsocketsFoldersService websocketsFoldersService, WebsocketsNotesService websocketsNotesService)
        {
            this.websocketsFoldersService = websocketsFoldersService;
            this.websocketsNotesService = websocketsNotesService;
        }

        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            int hourse = 2;
            var earliestTimestamp = DateTimeProvider.Time.AddHours(-hourse);

            while (!stoppingToken.IsCancellationRequested)
            {
                Debug.WriteLine("Start ManageUsersOnEntitiesHosted");

                Console.WriteLine("Is consist websockets notes: " + websocketsNotesService.IsConsist);
                Console.WriteLine("Websockets notes count: " + websocketsNotesService.CountActiveEntities);

                Console.WriteLine("Is consist websockets folders: " + websocketsFoldersService.IsConsist);
                Console.WriteLine("Websockets folders count: " + websocketsFoldersService.CountActiveEntities);

                websocketsFoldersService.ClearEmptyAfterDelay(earliestTimestamp);
                websocketsNotesService.ClearEmptyAfterDelay(earliestTimestamp);

                await Task.Delay(60000, stoppingToken);

                Debug.WriteLine("End ManageUsersOnEntitiesHosted");
            }
        }
    }
}
