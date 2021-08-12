using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Labels;
using WriteContext.Repositories.Notes;

namespace BI.JobsHandlers
{
    public class EntitiesRemoveHandler
    {
        private int N { set; get; } = 1;

        private readonly LabelRepository labelRepostory;

        private readonly NoteRepository noteRepository;

        private readonly FolderRepository folderRepository;

        public EntitiesRemoveHandler(
            LabelRepository labelRepostory,
            NoteRepository noteRepository,
            FolderRepository folderRepository)
        {
            this.labelRepostory = labelRepostory;
            this.noteRepository = noteRepository;
            this.folderRepository = folderRepository;
        }

        public async Task DeleteLabelsHandler()
        {
            Console.WriteLine("Start labels deleting");

            var earliestTimestamp = DateTimeOffset.UtcNow.AddSeconds(-N);

            var labels = await labelRepostory.GetLabelsThatNeedDeleteAfterTime(earliestTimestamp);

            Console.WriteLine($"delete: {labels.Count()} labels");

            await labelRepostory.RemoveRangeAsync(labels);

            Console.WriteLine("Labels was deleted");
        }

        public async Task DeleteNotesHandler()
        {
            Console.WriteLine("Start notes deleting");

            var earliestTimestamp = DateTimeOffset.UtcNow.AddSeconds(-N);

            var notes = await noteRepository.GetNotesThatNeedDeleteAfterTime(earliestTimestamp);

            Console.WriteLine($"delete: {notes.Count()} notes");

            await noteRepository.RemoveRangeAsync(notes);

            Console.WriteLine("Notes was deleted");
        }

        public async Task DeleteFoldersHandler()
        {
            Console.WriteLine("Start folders deleting");

            var earliestTimestamp = DateTimeOffset.UtcNow.AddSeconds(-N);

            var folders = await folderRepository.GetFoldersThatNeedDeleteAfterTime(earliestTimestamp);

            Console.WriteLine($"delete: {folders.Count()} folders");

            await folderRepository.RemoveRangeAsync(folders);

            Console.WriteLine("Folders was deleted");
        }
    }
}
