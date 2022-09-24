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
        return entities.Include(x => x.UserIdentifierConnectionIdId)
                       .Where(x => x.NoteId == noteId)
                       .Select(x => x.UserIdentifierConnectionId).ToListAsync();
    }
}
 