using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.Notes;
using Microsoft.EntityFrameworkCore;

namespace Noots.DatabaseContext.Repositories
{
    public class SearchRepository
    {
        private readonly NootsDBContext context;
        public SearchRepository(NootsDBContext contextDB)
        {
            this.context = contextDB;
        }

        // TODO MAKE FOR ALL NOTES
        public async Task<List<Note>> GetNotesByUserIdSearch(Guid userId)
        {
            return await context.Notes // TODO OPTIMIZATION
                .Include(x => x.FoldersNotes).ThenInclude(q => q.Folder)
                .Include(x => x.LabelsNotes).ThenInclude(q => q.Label)
                .Include(x => x.Contents).ThenInclude(q => (q as CollectionNote).Files)
                .Where(x => x.UserId == userId).ToListAsync();
        }

        // TODO MAKE FOR ALL FOLDERS
        public async Task<List<Folder>> GetFolderByUserIdAndString(Guid userId, string searchStr)
        {
            var folders = await context.Folders.Where(x => x.UserId == userId).ToListAsync();
            return folders.Where(x =>
            {
                var title = x.GetTitle();
                if (title == null) return false;
                return title.ReadStr().Contains(searchStr);
            }).ToList();
        }

    }
}
