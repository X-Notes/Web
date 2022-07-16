using Common;
using Common.Timers;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Histories;
using WriteContext.Repositories.Labels;
using WriteContext.Repositories.Notes;

namespace BI.JobsHandlers
{

    public class EntitiesDeleteJobHandler
    {
        private readonly LabelRepository labelRepostory;

        private readonly NoteRepository noteRepository;

        private readonly FolderRepository folderRepository;

        private readonly TimersConfig timersConfig;

        private readonly NoteSnapshotRepository noteSnapshotRepository;

        private readonly ILogger<EntitiesDeleteJobHandler> logger;

        public EntitiesDeleteJobHandler(
            LabelRepository labelRepostory,
            NoteRepository noteRepository,
            FolderRepository folderRepository,
            TimersConfig timersConfig,
            NoteSnapshotRepository noteSnapshotRepository,
            ILogger<EntitiesDeleteJobHandler> logger)
        {
            this.labelRepostory = labelRepostory;
            this.noteRepository = noteRepository;
            this.folderRepository = folderRepository;
            this.timersConfig = timersConfig;
            this.noteSnapshotRepository = noteSnapshotRepository;
            this.logger = logger;
        }

        public async Task DeleteLabelsHandler()
        {
            try
            {
                logger.LogInformation("Start labels deleting");

                var earliestTimestamp = DateTimeProvider.Time.AddDays(-timersConfig.DeleteLabelsNDays);

                var labels = await labelRepostory.GetLabelsThatNeedDeleteAfterTime(earliestTimestamp);

                if (labels.Any())
                {
                    logger.LogInformation($"{labels.Count()} labels will be deleted");
                    await labelRepostory.RemoveRangeAsync(labels);
                    logger.LogInformation("Labels was deleted");
                }
            } catch(Exception ex)
            {
                logger.LogError(ex.ToString());
            }
        }

        public async Task DeleteNotesHandler()
        {
            try
            {
                logger.LogInformation("Start notes deleting");

                var earliestTimestamp = DateTimeProvider.Time.AddDays(-timersConfig.DeleteNotesNDays);
                var notes = await noteRepository.GetNotesThatNeedDeleteAfterTime(earliestTimestamp);

                if (notes.Any())
                {
                    logger.LogInformation($"{notes.Count()} notes will be deleted");
                    await noteRepository.RemoveRangeAsync(notes);
                    logger.LogInformation("Notes was deleted");
                }
            }
            catch(Exception ex)
            {
                logger.LogError(ex.ToString());
            }
        }

        public async Task DeleteFoldersHandler()
        {
            try
            {
                logger.LogInformation("Start folders deleting");

                var earliestTimestamp = DateTimeProvider.Time.AddDays(-timersConfig.DeleteFoldersNDays);
                var folders = await folderRepository.GetFoldersThatNeedDeleteAfterTime(earliestTimestamp);

                if (folders.Any())
                {
                    logger.LogInformation($"{folders.Count()} folders will be deleted");
                    await folderRepository.RemoveRangeAsync(folders);
                    logger.LogInformation("Folders was deleted");
                }
            }
            catch(Exception ex)
            {
                logger.LogError(ex.ToString());
            }
        }

        public async Task DeleteHistoryHandler()
        {
            try
            {
                logger.LogInformation("Start snapshots deleting");

                var earliestTimestamp = DateTimeProvider.Time.AddDays(-timersConfig.DeleteHistoriesNDays);
                var snapshots = await noteSnapshotRepository.GetSnapshotsThatNeedDeleteAfterTime(earliestTimestamp);

                if (snapshots.Any())
                {
                    logger.LogInformation($"{snapshots.Count()} snapshots will be deleted");
                    await noteSnapshotRepository.RemoveRangeAsync(snapshots);
                    logger.LogInformation("Folders was deleted");
                }
            }
            catch(Exception ex) 
            {
                logger.LogError(ex.ToString());
            }
        }
    }
}
