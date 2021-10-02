using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Folders;
using WriteContext.GenericRepositories;
using Common.DatabaseModels.Models.NoteContent.FileContent;

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

        public async Task<List<FoldersNotes>> GetOrderedByFolderIdAndNotesId(Guid folderId, List<Guid> notesIds)
        {
            return await entities.Where(x => x.FolderId == folderId && notesIds.Contains(x.NoteId)).OrderBy(x => x.Order).ToListAsync();
        }

        public async Task<List<FoldersNotes>> GetByNoteIdsIncludeFolder(List<Guid> noteIds)
        {
            return await entities.Where(ent => noteIds.Contains(ent.NoteId)).Include(x => x.Folder).ToListAsync();
        }


    }
}
