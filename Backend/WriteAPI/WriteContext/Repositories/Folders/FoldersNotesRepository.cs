using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Folders;
using WriteContext.GenericRepositories;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.Notes;

namespace WriteContext.Repositories.Folders
{
    public class FoldersNotesRepository : Repository<FoldersNotes, Guid>
    {
        public FoldersNotesRepository(WriteContextDB contextDB)
        : base(contextDB)
        {
        }

        public async Task<List<FoldersNotes>> GetOrderedByFolderId(Guid folderId)
        {
            return await entities.Where(x => x.FolderId == folderId).OrderBy(x => x.Order).ToListAsync();
        }

        public async Task<List<FoldersNotes>> GetByNoteIdsIncludeFolder(List<Guid> noteIds)
        {
            return await entities.Where(ent => noteIds.Contains(ent.NoteId)).Include(x => x.Folder).ToListAsync();
        }

        public async Task<List<Note>> GetNotes(Guid folderId)
        {
            return await entities
                .Include(x => x.Note)
                .Where(x => x.FolderId == folderId)
                .Select(x => x.Note)
                .OrderBy(x => x.Order).ToListAsync();
        }

    }
}
