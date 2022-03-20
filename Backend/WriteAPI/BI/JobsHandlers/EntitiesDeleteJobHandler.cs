using Common;
using Common.Timers;
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

        public EntitiesDeleteJobHandler(
            LabelRepository labelRepostory,
            NoteRepository noteRepository,
            FolderRepository folderRepository,
            TimersConfig timersConfig,
            NoteSnapshotRepository noteSnapshotRepository)
        {
            this.labelRepostory = labelRepostory;
            this.noteRepository = noteRepository;
            this.folderRepository = folderRepository;
            this.timersConfig = timersConfig;
            this.noteSnapshotRepository = noteSnapshotRepository;
        }

        public async Task DeleteLabelsHandler()
        {
            try
            {
                Console.WriteLine("Start labels deleting");

                var earliestTimestamp = DateTimeProvider.Time.AddDays(-timersConfig.DeleteLabelsNDays);

                var labels = await labelRepostory.GetLabelsThatNeedDeleteAfterTime(earliestTimestamp);

                if (labels.Any())
                {
                    Console.WriteLine($"{labels.Count()} labels will be deleted");
                    await labelRepostory.RemoveRangeAsync(labels);
                    Console.WriteLine("Labels was deleted");
                }
            }catch(Exception ex)
            {
                Console.WriteLine(ex);
            }
        }

        public async Task DeleteNotesHandler()
        {
            try
            {
                Console.WriteLine("Start notes deleting");

                var earliestTimestamp = DateTimeProvider.Time.AddDays(-timersConfig.DeleteNotesNDays);
                var notes = await noteRepository.GetNotesThatNeedDeleteAfterTime(earliestTimestamp);

                if (notes.Any())
                {
                    Console.WriteLine($"{notes.Count()} notes will be deleted");
                    await noteRepository.RemoveRangeAsync(notes);
                    Console.WriteLine("Notes was deleted");
                }
            }catch(Exception ex)
            {
                Console.WriteLine(ex);
            }
        }

        public async Task DeleteFoldersHandler()
        {
            try
            {
                Console.WriteLine("Start folders deleting");

                var earliestTimestamp = DateTimeProvider.Time.AddDays(-timersConfig.DeleteFoldersNDays);
                var folders = await folderRepository.GetFoldersThatNeedDeleteAfterTime(earliestTimestamp);

                if (folders.Any())
                {
                    Console.WriteLine($"{folders.Count()} folders will be deleted");
                    await folderRepository.RemoveRangeAsync(folders);
                    Console.WriteLine("Folders was deleted");
                }
            }catch(Exception ex)
            {
                Console.WriteLine(ex);
            }
        }

        public async Task DeleteHistoryHandler()
        {
            try
            {
                Console.WriteLine("Start snapshots deleting");

                var earliestTimestamp = DateTimeProvider.Time.AddDays(-timersConfig.DeleteHistoriesNDays);
                var snapshots = await noteSnapshotRepository.GetSnapshotsThatNeedDeleteAfterTime(earliestTimestamp);

                if (snapshots.Any())
                {
                    Console.WriteLine($"{snapshots.Count()} snapshots will be deleted");
                    await noteSnapshotRepository.RemoveRangeAsync(snapshots);
                    Console.WriteLine("Folders was deleted");
                }
            }catch(Exception ex) 
            {  
                Console.WriteLine(ex.ToString());
            }
        }
    }
}
