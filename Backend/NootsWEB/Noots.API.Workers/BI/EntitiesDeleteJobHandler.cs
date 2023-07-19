using Common;
using Noots.API.Workers.Models.Config;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Histories;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Notes.Handlers.Commands;

namespace Noots.API.Workers.BI
{

    public class EntitiesDeleteJobHandler
    {
        private readonly LabelRepository labelRepostory;

        private readonly NoteRepository noteRepository;

        private readonly FolderRepository folderRepository;

        private readonly JobsTimerConfig jobsTimerConfig;

        private readonly NoteSnapshotRepository noteSnapshotRepository;

        private readonly ILogger<EntitiesDeleteJobHandler> logger;

        private readonly DeleteNotesCommandHandler deleteNotesCommandHandler;

        public EntitiesDeleteJobHandler(
            LabelRepository labelRepostory,
            NoteRepository noteRepository,
            FolderRepository folderRepository,
            JobsTimerConfig timersConfig,
            NoteSnapshotRepository noteSnapshotRepository,
            ILogger<EntitiesDeleteJobHandler> logger,
            DeleteNotesCommandHandler deleteNotesCommandHandler)
        {
            this.labelRepostory = labelRepostory;
            this.noteRepository = noteRepository;
            this.folderRepository = folderRepository;
            jobsTimerConfig = timersConfig;
            this.noteSnapshotRepository = noteSnapshotRepository;
            this.logger = logger;
            this.deleteNotesCommandHandler = deleteNotesCommandHandler;
        }

        public async Task DeleteLabelsHandler()
        {
            try
            {
                logger.LogInformation("Start labels deleting");

                var earliestTimestamp = DateTimeProvider.Time.AddDays(-jobsTimerConfig.DeleteLabelsNDays);

                var labels = await labelRepostory.GetLabelsThatNeedDeleteAfterTime(earliestTimestamp);

                if (labels.Any())
                {
                    logger.LogInformation($"{labels.Count()} labels will be deleted");
                    await labelRepostory.RemoveRangeAsync(labels);
                    logger.LogInformation("Labels was deleted");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.ToString());
            }
        }

        public async Task DeleteNotesHandler()
        {
            try
            {
                logger.LogInformation("Start notes deleting");

                var earliestTimestamp = DateTimeProvider.Time.AddDays(-jobsTimerConfig.DeleteNotesNDays);
                var notes = await noteRepository.GetNotesThatNeedDeleteAfterTime(earliestTimestamp);

                if (notes.Any())
                {
                    logger.LogInformation($"{notes.Count()} notes will be deleted");
                    await deleteNotesCommandHandler.DeleteNotesAsync(notes);
                    logger.LogInformation("Notes was deleted");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.ToString());
            }
        }

        public async Task DeleteFoldersHandler()
        {
            try
            {
                logger.LogInformation("Start folders deleting");

                var earliestTimestamp = DateTimeProvider.Time.AddDays(-jobsTimerConfig.DeleteFoldersNDays);
                var folders = await folderRepository.GetFoldersThatNeedDeleteAfterTime(earliestTimestamp);

                if (folders.Any())
                {
                    logger.LogInformation($"{folders.Count()} folders will be deleted");
                    await folderRepository.RemoveRangeAsync(folders);
                    logger.LogInformation("Folders was deleted");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.ToString());
            }
        }

        public async Task DeleteHistoryHandler()
        {
            try
            {
                logger.LogInformation("Start snapshots deleting");

                var earliestTimestamp = DateTimeProvider.Time.AddDays(-jobsTimerConfig.DeleteHistoriesNDays);
                var snapshots = await noteSnapshotRepository.GetSnapshotsThatNeedDeleteAfterTime(earliestTimestamp);

                if (snapshots.Any())
                {
                    logger.LogInformation($"{snapshots.Count()} snapshots will be deleted");
                    await noteSnapshotRepository.RemoveRangeAsync(snapshots);
                    logger.LogInformation("Folders was deleted");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.ToString());
            }
        }
    }
}
