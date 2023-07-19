using Common.DatabaseModels.Models.WS;

namespace Noots.SignalrUpdater.Interfaces;

public interface IFolderServiceStorage
{
    Task<bool> IsContainsConnectionId(Guid folderId, string connectionId);

    Task<List<UserIdentifierConnectionId>> GetEntitiesId(Guid folderId);

    Task<List<string>> GetConnectionsByFolderIdAsync(Guid folderId, Guid exceptUserId);
    Task<List<string>> GetConnectionsByFolderIdAsync(Guid folderId);
    Task<List<string>> GetConnectionsByFolderIdsAsync(IEnumerable<Guid> folderIds);

    Task<List<Guid>> GetUserIdsByFolderId(Guid folderId, Guid exceptUserId);
    Task<List<Guid>> GetUserIdsByFolderId(Guid folderId);
    Task<List<Guid>> GetUserIdsByFolderIds(List<Guid> folderIds);

    Task AddAsync(Guid folderId, UserIdentifierConnectionId userIdentity);
    Task RemoveAsync(Guid folderId, Guid userIdentifier);
    Task<int> UsersOnFolderAsync(Guid folderId, Guid exceptUserId);
}
