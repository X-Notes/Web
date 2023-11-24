using Common.DatabaseModels.Models.Folders;
using Common.DTO.Personalization;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.Folders
{
    public class FolderRepository : Repository<Folder, Guid>
    {
        public FolderRepository(NootsDBContext contextDB)
            : base(contextDB)
        {
        }

        public async Task<List<Folder>> GetFoldersThatNeedDeleteAfterTime(DateTimeOffset earliestTimestamp)
        {
            return await entities.Where(x => x.FolderTypeId == FolderTypeENUM.Deleted && x.DeletedAt.HasValue && x.DeletedAt.Value < earliestTimestamp).ToListAsync();
        }


        public Task<Folder?> GetForCheckPermission(Guid id)
        {
            return context.Folders
                .Include(x => x.UsersOnPrivateFolders)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task<List<Folder>> GetForCheckPermissions(List<Guid> ids)
        {
            return context.Folders
                .Include(x => x.UsersOnPrivateFolders)
                .Where(x => ids.Contains(x.Id)).ToListAsync();
        }

        public Task<List<Folder>> GetFoldersByIdsIncludeNotes(List<Guid> ids)
        {
            return context.Folders
                .Include(x => x.FoldersNotes)
                .ThenInclude(x => x.Note)
                .Where(x => ids.Contains(x.Id)).ToListAsync();
        }

        public Task<List<Folder>> GetFoldersByUserIdAndTypeIdNotesIncludeNote(Guid userId, FolderTypeENUM typeId)
        {
            return context.Folders
                .Include(x => x.UsersOnPrivateFolders)
                .Include(x => x.FoldersNotes)
                .ThenInclude(x => x.Note)
                .Where(x => x.UserId == userId && x.FolderTypeId == typeId).ToListAsync();
        }

        public Task<List<Folder>> GetFoldersIncludeNote(Guid userId, List<Guid> folderIds)
        {
            return context.Folders
                .Include(x => x.UsersOnPrivateFolders)
                .Include(x => x.FoldersNotes)
                .ThenInclude(x => x.Note)
                .Where(x => x.UserId == userId && folderIds.Contains(x.Id)).ToListAsync();
        }

        public async Task<List<Folder>> GetFoldersByUserIdAndTypeIdNotesIncludeNote(Guid userId, FolderTypeENUM typeId, PersonalizationSettingDTO settings)
        {
            var result = await GetFoldersByUserIdAndTypeIdNotesIncludeNote(userId, typeId);
            result.ForEach(x => x.FoldersNotes = x.FoldersNotes.OrderBy(x => x.Order).Take(settings.NotesInFolderCount).ToList());
            return result;
        }

        public async Task<List<Folder>> GetFoldersByFolderIdsIncludeNote(IEnumerable<Guid> folderIds, PersonalizationSettingDTO settings)
        {
            var result = await context.Folders
                .Include(x => x.UsersOnPrivateFolders)
                .Include(x => x.FoldersNotes)
                .ThenInclude(x => x.Note)
                .Where(x => folderIds.Contains(x.Id)).ToListAsync();
            result.ForEach(x => x.FoldersNotes = x.FoldersNotes.OrderBy(x => x.Order).Take(settings.NotesInFolderCount).ToList());
            return result;
        }

    }
}
