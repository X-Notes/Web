using Common.DatabaseModels.Models.Folders;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Folders;

public class UsersOnPrivateFoldersRepository : Repository<UsersOnPrivateFolders, Guid>
{
    public UsersOnPrivateFoldersRepository(NootsDBContext contextDB)
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
