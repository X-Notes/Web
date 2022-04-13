using BI.Services.Encryption;
using Common.Timers;
using Microsoft.Extensions.Hosting;
using System.Threading;
using System.Threading.Tasks;

namespace WriteAPI.Hosted
{
    public class ManageUnlockNotesHosted : BackgroundService
    {
        private readonly HostedTimersConfig hostedTimersConfig;
        private readonly UserNoteEncryptService userNoteEncryptStorage;

        public ManageUnlockNotesHosted(HostedTimersConfig hostedTimersConfig, UserNoteEncryptService userNoteEncryptStorage)
        {
            this.hostedTimersConfig = hostedTimersConfig;
            this.userNoteEncryptStorage = userNoteEncryptStorage;
        }

        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                userNoteEncryptStorage.ClearTimers();
                await Task.Delay(hostedTimersConfig.UnlockCallClearSeconds * 1000, stoppingToken);
            }
        }
    }
}
