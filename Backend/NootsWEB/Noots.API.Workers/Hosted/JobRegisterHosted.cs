using Hangfire;
using Noots.API.Workers.BI;

namespace Noots.API.Workers.Hosted
{
    public class JobRegisterHosted : IHostedService
    {
        string Delay;

        public JobRegisterHosted()
        {
            Delay = Cron.Minutely(); // TODO REMOVE AFTER TESTING
        }


        public Task StartAsync(CancellationToken cancellationToken)
        {
            RecurringJob.AddOrUpdate<FoldersJobHandler>(JobNames.FoldersJobs, x => x.HandleAsync(), Delay);
            RecurringJob.AddOrUpdate<LabelsJobHandler>(JobNames.LabelsJobs, x => x.HandleAsync(), Delay);
            RecurringJob.AddOrUpdate<NotesJobHandler>(JobNames.NotesJobs, x => x.HandleAsync(), Delay);
            RecurringJob.AddOrUpdate<RemoveDeadWSConnectionsHandler>(JobNames.RemoveConnectionsJobs, x => x.HandleAsync(), Delay);
            RecurringJob.AddOrUpdate<RemoveExpiredTokensHandler>(JobNames.RemoveTokensJobs, x => x.HandleAsync(), Delay);
            RecurringJob.AddOrUpdate<UnlinkedFilesDeleteJobHandler>(JobNames.RemoveFilesJobs, x => x.HandleAsync(), Delay);
            RecurringJob.AddOrUpdate<MarkLostFilesAsUnlinkedJobHandler>(JobNames.MarkLostedFilesAsUnlinked, x => x.HandleAsync(), Delay);

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
