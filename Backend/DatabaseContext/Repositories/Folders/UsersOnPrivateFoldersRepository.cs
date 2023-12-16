using Common.DatabaseModels.Models.Folders;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.Folders;

public class UsersOnPrivateFoldersRepository : Repository<UsersOnPrivateFolders, Guid>
{
    public UsersOnPrivateFoldersRepository(ApiDbContext contextDB)
        :base(contextDB)
    {
    }

    public Task<List<UsersOnPrivateFolders>> GetByFolderIdUserOnPrivateFolder(Guid folderId)
    {
        return context.UsersOnPrivateFolders
            .Include(x => x.User)
            .Where(x => x.FolderId == folderId).ToListAsync();
    }

    public async Task<UsersOnPrivateFolders?> GetUserAsync(Guid folderId, Guid userId)
    {
        return await entities.FirstOrDefaultAsync(x => x.FolderId == folderId && x.UserId == userId);
    }

    public async Task<List<Guid>> GetFolderUserIdsAsync(Guid folderId)
    {
        return await context.UsersOnPrivateFolders
            .Where(x => x.FolderId == folderId)
            .Select(x => x.UserId)
            .ToListAsync();
    }

    public Task<List<UsersOnPrivateFolders>> GetByFolderIds(List<Guid> folderIds)
    {
        return entities.Where(x => folderIds.Contains(x.FolderId)).ToListAsync();
    }
}
