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
            RecurringJob.AddOrUpdate<EntitiesDeleteJobHandler>(JobNames.HistoryDelete, x => x.DeleteHistoryHandler(), Delay);
        }

        public void MakeHistory()
        {
            BackgroundJob.Enqueue<HistoryJobHandler>(x => x.MakeHistoryHandler());
            RecurringJob.AddOrUpdate<HistoryJobHandler>(JobNames.HistoryMake, x => x.MakeHistoryHandler(), Delay);
        }

        public void UnLinkedFilesDelete()
        {
            BackgroundJob.Enqueue<UnlinkedFilesDeleteJobHandler>(x => x.DeleteUnLinkedFiles());
            RecurringJob.AddOrUpdate<UnlinkedFilesDeleteJobHandler>(JobNames.UnlinkedFilesDelete, x => x.DeleteUnLinkedFiles(), Delay);
        }

        public void RemoveDeadWSConnections()
        {
            BackgroundJob.Enqueue<RemoveDeadWSConnectionsHandler>(x => x.Handle());
            RecurringJob.AddOrUpdate<RemoveDeadWSConnectionsHandler>(JobNames.RemoveDeadWSConnections, x => x.Handle(), Delay);
        }

        public void IndexTextContent()
        {
            BackgroundJob.Enqueue<IndexTextNoteContentJobHandler>(x => x.Handle());
            RecurringJob.AddOrUpdate<IndexTextNoteContentJobHandler>(JobNames.IndexTexts, x => x.Handle(), Delay);
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            DeleteLabels();
            DeleteNotes();
            DeleteFolders();
            DeleteHistory();
            MakeHistory();
            UnLinkedFilesDelete();
            RemoveDeadWSConnections();
            IndexTextContent();

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
