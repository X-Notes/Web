using BI.JobsHandlers;
using BI.Services.History;
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
            BackgroundJob.Enqueue<EntitiesDeleteJobHandler>(x => x.DeleteNotesHandler());
            RecurringJob.AddOrUpdate<EntitiesDeleteJobHandler>(JobNames.NotesDelete, x => x.DeleteNotesHandler(), Delay);
        }

        public void DeleteLabels()
        {
            BackgroundJob.Enqueue<EntitiesDeleteJobHandler>(x => x.DeleteLabelsHandler());
            RecurringJob.AddOrUpdate<EntitiesDeleteJobHandler>(JobNames.LabelsDelete, x => x.DeleteLabelsHandler(), Delay);
        }

        public void DeleteFolders()
        {
            BackgroundJob.Enqueue<EntitiesDeleteJobHandler>(x => x.DeleteFoldersHandler());
            RecurringJob.AddOrUpdate<EntitiesDeleteJobHandler>(JobNames.FoldersDelete, x => x.DeleteFoldersHandler(), Delay);
        }

        public void DeleteHistory()
        {
            BackgroundJob.Enqueue<EntitiesDeleteJobHandler>(x => x.DeleteHistoryHandler());
            RecurringJob.AddOrUpdate<EntitiesDeleteJobHandler>(JobNames.FoldersDelete, x => x.DeleteHistoryHandler(), Delay);
        }

        public void MakeHistory()
        {
            BackgroundJob.Enqueue<HistoryJobHandler>(x => x.MakeHistoryHandler());
            RecurringJob.AddOrUpdate<HistoryJobHandler>(JobNames.HistoryMake, x => x.MakeHistoryHandler(), Delay);
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            DeleteLabels();
            DeleteNotes();
            DeleteFolders();
            DeleteHistory();
            MakeHistory();

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
