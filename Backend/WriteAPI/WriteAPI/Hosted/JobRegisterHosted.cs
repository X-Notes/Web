using BI.JobsHandlers;
using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
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
            Delay = Cron.Minutely;
        }

        public void DeleteNotes()
        {
            BackgroundJob.Enqueue<EntitiesRemoveHandler>(x => x.DeleteNotesHandler());
            RecurringJob.AddOrUpdate<EntitiesRemoveHandler>(JobNames.NotesDelete, x => x.DeleteNotesHandler(), Delay);
        }

        public void DeleteLabels()
        {
            BackgroundJob.Enqueue<EntitiesRemoveHandler>(x => x.DeleteLabelsHandler());
            RecurringJob.AddOrUpdate<EntitiesRemoveHandler>(JobNames.LabelsDelete, x => x.DeleteLabelsHandler(), Delay);
        }

        public void DeleteFolders()
        {
            BackgroundJob.Enqueue<EntitiesRemoveHandler>(x => x.DeleteFoldersHandler());
            RecurringJob.AddOrUpdate<EntitiesRemoveHandler>(JobNames.FoldersDelete, x => x.DeleteFoldersHandler(), Delay);
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            DeleteLabels();
            DeleteNotes();
            DeleteFolders();

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
