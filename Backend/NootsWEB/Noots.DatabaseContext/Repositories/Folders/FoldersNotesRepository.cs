using Common.DatabaseModels.Models.Folders;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Folders
{
    public class FoldersNotesRepository : Repository<FoldersNotes, Guid>
    {
        public FoldersNotesRepository(NootsDBContext contextDB)
        : base(contextDB)
        {
        }

        public Task<List<FoldersNotes>> GetByFolderId(Guid folderId)
        {
            return entities.Where(x => x.FolderId == folderId).ToListAsync();
        }

        public Task<List<Guid>> GetNoteIdsByFolderId(Guid folderId)
        {
            return entities.Where(x => x.FolderId == folderId).Select(x => x.NoteId).ToListAsync();
        }

        public Task<List<FoldersNotes>> GetByFolderIdAndNoteIds(Guid folderId, List<Guid> noteIds)
        {
            return entities.Where(x => x.FolderId == folderId && noteIds.Contains(x.NoteId)).ToListAsync();
        }

        public Task<List<FoldersNotes>> GetByNoteIdsIncludeFolder(List<Guid> noteIds)
        {
            return entities.Where(ent => noteIds.Contains(ent.NoteId)).Include(x => x.Folder).ToListAsync();
        }

        public async Task<List<string>> GetNotesTitle(Guid folderId)
        {
            var ents = await entities
                .Include(x => x.Note)
                .Where(x => x.FolderId == folderId)
                .OrderBy(x => x.Order)
                .Select(x => x.Note).ToListAsync();

            return ents.Select(x => x.GetTitle()?.ReadStr()).ToList();
        }
    }
}
