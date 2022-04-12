using Common;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;

namespace BI.SignalR
{
    public class WsEntityInfo
    {
        public Guid? UserId { set; get; }

        public string ConnectionId { set; get; }
    }

    public class WsEntitiesState
    {
        public ConcurrentDictionary<string, WsEntityInfo> Users { get; set; } = new();

        public DateTimeOffset UpdateTime { set; get; }
    }

    public class WebsocketsBaseEntities
    {
        protected static ConcurrentDictionary<Guid, WsEntitiesState> entityId_users = new();

        public int CountActiveEntities => entityId_users.Count;

        public bool IsContainsId(Guid entityId) => entityId_users.ContainsKey(entityId);

        public bool IsContainsConnectionId(Guid entityId, string connectionId) => IsContainsId(entityId) && entityId_users[entityId].Users.ContainsKey(connectionId);

        public List<WsEntityInfo> GetEntitiesId(Guid entityId)
        {
            if (entityId_users.TryGetValue(entityId, out var value))
            {
                return value.Users.Values.ToList();
            }
            return new List<WsEntityInfo>();
        }

        public List<string> GetConnectiondsById(Guid entityId)
        {
            if (entityId_users.TryGetValue(entityId, out var value))
            {
                return value.Users.Select(x => x.Value.ConnectionId).ToList();
            }
            return new List<string>();
        }

        public bool Add(Guid entityId, string connectionId, Guid? userId)
        {
            if (entityId_users.TryGetValue(entityId, out var state))
            {
                if (!state.Users.ContainsKey(connectionId))
                {
                    var ent = new WsEntityInfo { ConnectionId = connectionId, UserId = userId };
                    if (state.Users.TryAdd(connectionId, ent))
                    {
                        state.UpdateTime = DateTimeProvider.Time;
                        return true;
                    }
                }
            }
            else
            {
                var newState = new WsEntitiesState { UpdateTime = DateTimeProvider.Time };
                var ent = new WsEntityInfo { ConnectionId = connectionId, UserId = userId };
                newState.Users.TryAdd(connectionId, ent);

                return entityId_users.TryAdd(entityId, newState);
            }

            return false;
        }

        public bool Remove(Guid entityId, string connectionId)
        {
            if (!entityId_users.TryGetValue(entityId, out var state))
            {
                return true;
            }
            else
            {
                if (state.Users.ContainsKey(connectionId))
                {
                    if (state.Users.TryRemove(connectionId, out var value))
                    {
                        state.UpdateTime = DateTimeProvider.Time;
                        return true;
                    }
                }
            }

            return false;
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
                    Console.WriteLine("Try to delete next values: ", string.Join(",", idsToDelete));
                    try
                    {
                        foreach (var id in idsToDelete)
                        {
                            if (entityId_users.ContainsKey(id) && entityId_users.TryRemove(id, out var value))
                            {
                                idsThatWasDeleted.Add(id);
                            }
                        }
                    } catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                    }
                    finally
                    {
                        Console.WriteLine("Delete next values: ", string.Join(",", idsThatWasDeleted));
                    }
                } 
            }
        }
    }
}
