using Common.DatabaseModels.Models.WS;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.WS;

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

    // Connections
    public Task<List<string>> GetConnectionsById(Guid noteId, Guid exceptUserId)
    {
        return entities.Where(x => x.NoteId == noteId && x.UserId != exceptUserId)
                       .Select(x => x.ConnectionId).ToListAsync();
    }

    public Task<List<string>> GetConnectionsById(Guid noteId)
    {
        return entities.Where(x => x.NoteId == noteId).Select(x => x.ConnectionId).ToListAsync();
    }

    // User IDs
    public Task<List<Guid>> GetUserIdsByNoteId(Guid noteId, Guid exceptUserId)
    {
        return entities.Where(x => x.NoteId == noteId && x.UserId != exceptUserId).Select(x => x.UserId).ToListAsync();
    }

    public Task<List<Guid>> GetUserIdsByNoteId(Guid noteId)
    {
        return entities.Where(x => x.NoteId == noteId).Select(x => x.UserId).ToListAsync();
    }

    public Task<int> UsersOnNoteAsync(Guid noteId, Guid exceptUserId)
    {
        return entities.Where(x => x.NoteId == noteId && x.UserId != exceptUserId).GroupBy(x => x.UserId).CountAsync();
    }
}
 