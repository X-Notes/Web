using Common.DatabaseModels.Models.WS;

namespace Noots.SignalrUpdater.Interfaces;

public interface IFolderServiceStorage
{
    Task<bool> IsContainsConnectionId(Guid folderId, string connectionId);
    Task<List<UserIdentifierConnectionId>> GetEntitiesId(Guid folderId);
    Task<List<string>> GetConnectionsByIdAsync(Guid noteId, Guid exceptUserId);
    Task AddAsync(Guid folderId, UserIdentifierConnectionId userIdentity);
    Task RemoveAsync(Guid folderId, Guid userIdentifier);
}
