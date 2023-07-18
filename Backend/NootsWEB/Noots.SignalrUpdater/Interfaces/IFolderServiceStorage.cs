using Common.DatabaseModels.Models.WS;

namespace Noots.SignalrUpdater.Interfaces;

public interface IFolderServiceStorage
{
    Task<bool> IsContainsConnectionId(Guid folderId, string connectionId);

    Task<List<UserIdentifierConnectionId>> GetEntitiesId(Guid folderId);

    Task<List<string>> GetConnectionsByIdAsync(Guid noteId, Guid exceptUserId);
    Task<List<string>> GetConnectionsByIdAsync(Guid noteId);

    Task<List<Guid>> GetUserIdsByNoteId(Guid noteId, Guid exceptUserId);
    Task<List<Guid>> GetUserIdsByNoteId(Guid noteId);

    Task AddAsync(Guid folderId, UserIdentifierConnectionId userIdentity);
    Task RemoveAsync(Guid folderId, Guid userIdentifier);
    Task<int> UsersOnFolderAsync(Guid folderId, Guid exceptUserId);
}
