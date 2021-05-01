using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Folders;
using Common.DatabaseModels.models.NoteContent;
using Common.DatabaseModels.models.Notes;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
        public async Task<List<Note>> GetNotesByUserId(Guid userId)
        {
            return await context.Notes
                .Include(x => x.FoldersNotes).ThenInclude(z => z.Folder)
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents).ThenInclude(z => (z as AlbumNote).Photos)
                .Where(x => x.UserId == userId).ToListAsync();
        }

        // TODO MAKE FOR ALL FOLDERS
        public async Task<List<Folder>> GetFolderByUserIdAndString(Guid userId, string searchStr)
        {
            return await context.Folders.Where(x => x.UserId == userId && x.Title.Contains(searchStr)).ToListAsync();
        }

    }
}
