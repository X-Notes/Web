﻿using Common.DatabaseModels.Models.WS;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.WS;

public class UserIdentifierConnectionIdRepository : Repository<UserIdentifierConnectionId, Guid>
{
    public UserIdentifierConnectionIdRepository(ApiDbContext contextDB) : base(contextDB)
    {
    }

    public Task<UserIdentifierConnectionId?> GetConnectionAsync(Guid userId, string connectionId)
    {
        return entities.FirstOrDefaultAsync(x => x.UserId == userId && x.ConnectionId == connectionId);
    }

    public Task<List<string>> GetConnectionsAsync(List<Guid> userIds, Guid exceptUserId)
    {
        return entities.Where(x => x.UserId != exceptUserId && userIds.Contains(x.UserId)).Select(x => x.ConnectionId).ToListAsync();
    }

    public Task<List<string>> GetConnectionsAsync(List<Guid> userIds)
    {
        return entities.Where(x => userIds.Contains(x.UserId)).Select(x => x.ConnectionId).ToListAsync();
    }

    public Task<List<UserIdentifierConnectionId>> GetConnectionsByDateIncludeNotesFoldersAsync(DateTimeOffset earliestTimestamp)
    {
        return entities.Include(x => x.FolderConnections)
                       .Include(x => x.NoteConnections)
                       .Where(x => x.UpdatedAt < earliestTimestamp)
                       .ToListAsync();
    }
}
