using Common.DatabaseModels.Models.WS;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.WS;

public class NoteConnectionRepository : Repository<NoteConnection, int>
{
    public NoteConnectionRepository(NootsDBContext contextDB) : base(contextDB)
    {

    }

    public Task<List<UserIdentifierConnectionId>> GetUserConnectionsById(Guid noteId)
    {
        return entities.Include(x => x.UserIdentifierConnectionId)
                       .Where(x => x.NoteId == noteId)
                       .Select(x => x.UserIdentifierConnectionId).ToListAsync();
    }

    public Task<List<string>> GetConnectionsById(Guid noteId, Guid exceptUserId)
    {
        return entities.Where(x => x.NoteId == noteId && x.UserId != exceptUserId)
                       .Select(x => x.ConnectionId).ToListAsync();
    }
}
 