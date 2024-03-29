﻿using Common.DatabaseModels.Models.WS;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.WS;

public class FolderConnectionRepository : Repository<FolderConnection, int>
{
    public FolderConnectionRepository(ApiDbContext contextDB) : base(contextDB)
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
        return entities.Where(x => x.FolderId == folderId && x.UserId != exceptUserId)
                       .Select(x => x.ConnectionId).ToListAsync();
    }

    public Task<List<string>> GetConnectionsById(Guid folderId)
    {
        return entities.Where(x => x.FolderId == folderId).Select(x => x.ConnectionId).ToListAsync();
    }

    public Task<List<string>> GetConnectionsByIds(IEnumerable<Guid> folderIds)
    {
        return entities.Where(x => folderIds.Contains(x.FolderId)).Select(x => x.ConnectionId).ToListAsync();
    }

    public Task<List<Guid>> GetUserIdsByFolderId(Guid folderId, Guid exceptUserId)
    {
        return entities.Where(x => x.FolderId == folderId && x.UserId != exceptUserId).Select(x => x.UserId).ToListAsync();
    }

    public Task<List<Guid>> GetUserIdsByFolderId(Guid folderId)
    {
        return entities.Where(x => x.FolderId == folderId).Select(x => x.UserId).ToListAsync();
    }

    public Task<List<Guid>> GetUserIdsByFolderIds(List<Guid> folderIds)
    {
        return entities.Where(x => folderIds.Contains(x.FolderId)).Select(x => x.UserId).ToListAsync();
    }

    public Task<int> UsersOnFolderAsync(Guid folderId, Guid exceptUserId)
    {
        return entities.Where(x => x.FolderId == folderId && x.UserId != exceptUserId).GroupBy(x => x.UserId).CountAsync();
    }
}
