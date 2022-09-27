using Common.DatabaseModels.Models.WS;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.WS;

public class FolderConnectionRepository : Repository<FolderConnection, int>
{
    public FolderConnectionRepository(NootsDBContext contextDB) : base(contextDB)
    {

    }

    public Task<List<UserIdentifierConnectionId>> GetUserConnectionsById(Guid folderId)
    {
        return entities.Include(x => x.UserIdentifierConnectionId)
                       .Where(x => x.FolderId == folderId)
                       .Select(x => x.UserIdentifierConnectionId).ToListAsync();
    }

    public Task<List<string>> GetConnectionsById(Guid folderId, Guid exceptUserId)
    {
        return entities.Include(x => x.UserIdentifierConnectionId)
                       .Where(x => x.FolderId == folderId && x.UserId != exceptUserId)
                       .Select(x => x.ConnectionId).ToListAsync();
    }
}
