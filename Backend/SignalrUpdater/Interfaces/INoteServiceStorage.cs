﻿using Common.DatabaseModels.Models.WS;

namespace SignalrUpdater.Interfaces;

public interface INoteServiceStorage
{
    Task<bool> IsContainsConnectionId(Guid noteId, string connectionId);

    Task<List<UserIdentifierConnectionId>> GetEntitiesIdAsync(Guid noteId);

    Task<List<string>> GetConnectionsByIdAsync(Guid noteId, Guid exceptUserId);
    Task<List<string>> GetConnectionsByIdAsync(Guid noteId);

    Task<List<Guid>> GetUserIdsByNoteId(Guid noteId, Guid exceptUserId);
    Task<List<Guid>> GetUserIdsByNoteId(Guid noteId);

    Task AddAsync(Guid noteId, UserIdentifierConnectionId userIdentity);
    Task RemoveAsync(Guid noteId, Guid identifierId);

    Task<int> UsersOnNoteAsync(Guid noteId, Guid exceptUserId);
}
