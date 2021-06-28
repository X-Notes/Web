using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.Notes;

namespace WriteContext.Repositories
{
    public class SearchRepository
    {
        private readonly WriteContextDB context;
        public SearchRepository(WriteContextDB contextDB)
        {
            this.context = contextDB;
        }

        // TODO MAKE FOR ALL NOTES
        public async Task<List<Note>> GetNotesByUserIdSearch(Guid userId)
        {
            return await context.Notes
                .Include(x => x.FoldersNotes).ThenInclude(z => z.Folder)
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents).ThenInclude(z => (z as AlbumNote).Photos)
                .Where(x => x.UserId == userId && x.IsHistory == false).ToListAsync();
        }

        // TODO MAKE FOR ALL FOLDERS
        public async Task<List<Folder>> GetFolderByUserIdAndString(Guid userId, string searchStr)
        {
            return await context.Folders.Where(x => x.UserId == userId && x.Title.Contains(searchStr)).ToListAsync();
        }

    }
}
