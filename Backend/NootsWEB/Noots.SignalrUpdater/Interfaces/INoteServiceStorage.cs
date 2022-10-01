using Common.DatabaseModels.Models.WS;

namespace Noots.SignalrUpdater.Interfaces;

public interface INoteServiceStorage
{
    Task<bool> IsContainsConnectionId(Guid noteId, string connectionId);
    Task<List<UserIdentifierConnectionId>> GetEntitiesIdAsync(Guid noteId);
    Task<List<string>> GetConnectionsByIdAsync(Guid noteId, Guid exceptUserId);
    Task AddAsync(Guid noteId, UserIdentifierConnectionId userIdentity);
    Task RemoveAsync(Guid noteId, string connectionId);
}
