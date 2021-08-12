using BI.JobsHandlers;
using Hangfire;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading;
using System.Threading.Tasks;
using WriteAPI.ConfigureAPP;

namespace WriteAPI.Hosted
{
    public class JobRegisterHosted : IHostedService
    {
        Func<string> Delay;  

        public JobRegisterHosted()
        {
            Delay = Cron.Minutely; // TODO REMOVE AFTER TESTING
        }

        public void DeleteNotes()
        {
            BackgroundJob.Enqueue<EntitiesDeleteHandler>(x => x.DeleteNotesHandler());
            RecurringJob.AddOrUpdate<EntitiesDeleteHandler>(JobNames.NotesDelete, x => x.DeleteNotesHandler(), Delay);
        }

        public void DeleteLabels()
        {
            BackgroundJob.Enqueue<EntitiesDeleteHandler>(x => x.DeleteLabelsHandler());
            RecurringJob.AddOrUpdate<EntitiesDeleteHandler>(JobNames.LabelsDelete, x => x.DeleteLabelsHandler(), Delay);
        }

        public void DeleteFolders()
        {
            BackgroundJob.Enqueue<EntitiesDeleteHandler>(x => x.DeleteFoldersHandler());
            RecurringJob.AddOrUpdate<EntitiesDeleteHandler>(JobNames.FoldersDelete, x => x.DeleteFoldersHandler(), Delay);
        }

        public void DeleteHistory()
        {
            BackgroundJob.Enqueue<EntitiesDeleteHandler>(x => x.DeleteHistoryHandler());
            RecurringJob.AddOrUpdate<EntitiesDeleteHandler>(JobNames.FoldersDelete, x => x.DeleteHistoryHandler(), Delay);
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            DeleteLabels();
            DeleteNotes();
            DeleteFolders();
            DeleteHistory();

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
