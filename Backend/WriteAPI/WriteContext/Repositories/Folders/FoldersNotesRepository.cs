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

        public Task<List<FoldersNotes>> GetOrderedByFolderId(Guid folderId)
        {
            return entities.Where(x => x.FolderId == folderId).OrderBy(x => x.Order).ToListAsync();
        }

        public Task<List<FoldersNotes>> GetByNoteIdsIncludeFolder(List<Guid> noteIds)
        {
            return entities.Where(ent => noteIds.Contains(ent.NoteId)).Include(x => x.Folder).ToListAsync();
        }

        public Task<List<Note>> GetNotes(Guid folderId)
        {
            return entities
                .Include(x => x.Note)
                .Where(x => x.FolderId == folderId)
                .Select(x => x.Note)
                .OrderBy(x => x.Order).ToListAsync();
        }

        public Task<List<string>> GetNotesTitle(Guid folderId)
        {
            return entities
                .Include(x => x.Note)
                .Where(x => x.FolderId == folderId)
                .Select(x => x.Note)
                .OrderBy(x => x.Order).Select(x => x.Title).ToListAsync();
        }
    }
}
