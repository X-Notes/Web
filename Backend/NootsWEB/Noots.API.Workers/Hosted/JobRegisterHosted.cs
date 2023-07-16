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
            RecurringJob.AddOrUpdate<EntitiesDeleteJobHandler>(JobNames.NotesDelete, x => x.DeleteNotesHandler(), Delay);
        }

        public void DeleteLabels()
        {
            RecurringJob.AddOrUpdate<EntitiesDeleteJobHandler>(JobNames.LabelsDelete, x => x.DeleteLabelsHandler(), Delay);
        }

        public void DeleteFolders()
        {
            RecurringJob.AddOrUpdate<EntitiesDeleteJobHandler>(JobNames.FoldersDelete, x => x.DeleteFoldersHandler(), Delay);
        }

        public void DeleteHistory()
        {
            RecurringJob.AddOrUpdate<EntitiesDeleteJobHandler>(JobNames.HistoryDelete, x => x.DeleteHistoryHandler(), Delay);
        }

        public void MakeHistory()
        {
            RecurringJob.AddOrUpdate<HistoryJobHandler>(JobNames.HistoryMake, x => x.MakeHistoryHandler(), Delay);
        }

        public void UnLinkedFilesDelete()
        {
            RecurringJob.AddOrUpdate<UnlinkedFilesDeleteJobHandler>(JobNames.UnlinkedFilesDelete, x => x.DeleteUnLinkedFiles(), Delay);
        }

        public void RemoveDeadWSConnections()
        {
            RecurringJob.AddOrUpdate<RemoveDeadWSConnectionsHandler>(JobNames.RemoveDeadWSConnections, x => x.Handle(), Delay);
        }

        public void RemoveExpiredTokens()
        {
            RecurringJob.AddOrUpdate<RemoveExpiredTokensHandler>(JobNames.RemoveExpiredTokens, x => x.Handle(), Delay);
        }

        public void IndexTextContent()
        {
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
            RemoveExpiredTokens();

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
