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

    public Task<List<UsersOnPrivateFolders>> GetByFolderIds(List<Guid> folderIds)
    {
        return entities.Where(x => folderIds.Contains(x.FolderId)).ToListAsync();
    }
}
