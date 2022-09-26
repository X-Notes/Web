using Common.DatabaseModels.Models.WS;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.WS;

public class UserIdentifierConnectionIdRepository : Repository<UserIdentifierConnectionId, Guid>
{
    public UserIdentifierConnectionIdRepository(NootsDBContext contextDB) : base(contextDB)
    {
    }

    public Task<List<string>> GetConnectionsAsync(List<Guid> userIds, Guid exceptUserId)
    {
        return entities.Where(x => x.UserId != null && x.UserId != exceptUserId && userIds.Contains(x.UserId.Value))
                       .Select(x => x.ConnectionId).ToListAsync();
    }
}
