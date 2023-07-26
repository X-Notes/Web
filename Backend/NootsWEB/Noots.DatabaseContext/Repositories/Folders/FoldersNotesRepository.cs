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

        public Task<List<FoldersNotes>> GetFoldersNotesByFolderIdIncludeNote(IEnumerable<Guid> folderIds)
        {
            return entities
                .Include(x => x.Note)
                .Where(x => folderIds.Contains(x.FolderId)).ToListAsync();
        }

        public Task<List<FoldersNotes>> GetByFolderIdAndNoteIds(Guid folderId, List<Guid> noteIds)
        {
            return entities.Where(x => x.FolderId == folderId && noteIds.Contains(x.NoteId)).ToListAsync();
        }

        public Task<List<FoldersNotes>> GetByNoteIdsIncludeFolder(List<Guid> noteIds)
        {
            return entities.Where(ent => noteIds.Contains(ent.NoteId)).Include(x => x.Folder).ToListAsync();
        }

        public Task<List<FoldersNotes>> GetByNoteIdsIncludeFolderAndUsers(params Guid[] noteIds)
        {
            return entities.Where(ent => noteIds.Contains(ent.NoteId))
                    .Include(x => x.Folder)
                    .ThenInclude(x => x.UsersOnPrivateFolders)
                    .ToListAsync();
        }

        public Task<List<string>> GetNotesTitle(Guid folderId)
        {
            return entities
                .Include(x => x.Note)
                .Where(x => x.FolderId == folderId)
                .OrderBy(x => x.Order)
                .Select(x => x.Note).Select(x => x.Title).ToListAsync();
        }
    }
}
