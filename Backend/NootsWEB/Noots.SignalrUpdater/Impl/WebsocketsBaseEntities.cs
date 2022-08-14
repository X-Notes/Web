using Common;
using Common.DatabaseModels.Models.WS;
using Microsoft.Extensions.Logging;
using Noots.SignalrUpdater.Models;
using System.Collections.Concurrent;
using System.Collections.Immutable;

namespace Noots.SignalrUpdater.Impl
{

    public class WebsocketsBaseEntities
    {

        protected ConcurrentDictionary<Guid, WsEntitiesState> entityId_users = new();
        private readonly ILogger logger;

        public int CountActiveEntities => entityId_users.Count;

        public WebsocketsBaseEntities(ILogger logger)
        {
            this.logger = logger;
        }

        public bool IsContainsId(Guid entityId) => entityId_users.ContainsKey(entityId);

        public bool IsContainsConnectionId(Guid entityId, string connectionId) => IsContainsId(entityId) && entityId_users[entityId].Users.ContainsKey(connectionId);

        public List<UserIdentifierConnectionId> GetEntitiesId(Guid entityId)
        {
            if (entityId_users.TryGetValue(entityId, out var value))
            {
                return value.Users.Values.ToList();
            }
            return new List<UserIdentifierConnectionId>();
        }

        public List<string> GetConnectiondsById(Guid entityId, Guid exceptUserId)
        {
            if (entityId_users.TryGetValue(entityId, out var value))
            {
                return value.Users.Where(x => x.Value.UserId != exceptUserId).Select(x => x.Value.ConnectionId).ToList();
            }
            return new List<string>();
        }

        public bool Add(Guid entityId, UserIdentifierConnectionId userIdentity)
        {
            if (entityId_users.TryGetValue(entityId, out var state))
            {
                if (!state.Users.ContainsKey(userIdentity.ConnectionId))
                {
                    if (state.Users.TryAdd(userIdentity.ConnectionId, userIdentity))
                    {
                        state.UpdateTime = DateTimeProvider.Time;
                        return true;
                    }
                }
            }
            else
            {
                var newState = new WsEntitiesState { UpdateTime = DateTimeProvider.Time };
                newState.Users.TryAdd(userIdentity.ConnectionId, userIdentity);
                return entityId_users.TryAdd(entityId, newState);
            }

            return false;
        }

        public (bool isRemoved, UserIdentifierConnectionId user) Remove(Guid entityId, string connectionId)
        {
            if (!entityId_users.TryGetValue(entityId, out var state))
            {
                return (true, null);
            }
            else
            {
                if (state.Users.ContainsKey(connectionId))
                {
                    if (state.Users.TryRemove(connectionId, out var value))
                    {
                        state.UpdateTime = DateTimeProvider.Time;
                        return (true, value);
                    }
                }
            }

            return (false, null);
        }

        public List<(Guid entityId, Guid userId)> RemoveUserFromEntities(string connectionId)
        {
            var result = new List<(Guid, Guid)>();
            foreach (var ent in entityId_users)
            {
                if (ent.Value.Users.ContainsKey(connectionId))
                {
                    var removeResult = Remove(ent.Key, connectionId);
                    if (removeResult.isRemoved)
                    {
                        result.Add((ent.Key, removeResult.user.Id));
                    }
                }
            }
            return result;
        }

        public void ClearEmptyAfterDelay(DateTimeOffset earliestTimestamp)
        {
            var ids = entityId_users.Where(x => x.Value.UpdateTime < earliestTimestamp).Select(x => x.Key);
            if (ids.Any())
            {
                var idsToDelete = entityId_users.Where(x => ids.Contains(x.Key) && !x.Value.Users.Any()).Select(x => x.Key);
                if (idsToDelete.Any())
                {
                    var idsThatWasDeleted = new List<Guid>();

                    var message = "Try to delete next values: " + string.Join(",", idsToDelete);
                    logger.LogInformation(message);

                    try
                    {
                        foreach (var id in idsToDelete)
                        {
                            if (entityId_users.ContainsKey(id) && entityId_users.TryRemove(id, out var value))
                            {
                                idsThatWasDeleted.Add(id);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex.ToString());
                    }
                }
            }
        }
    }
}
