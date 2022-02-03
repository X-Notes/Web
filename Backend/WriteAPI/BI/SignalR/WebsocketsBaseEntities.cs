using Common;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;

namespace BI.SignalR
{
    public class WebsocketsBaseEntities
    {
        protected static ConcurrentDictionary<Guid, ImmutableList<Guid>> entityId_userIds = new ConcurrentDictionary<Guid, ImmutableList<Guid>>();

        protected static ConcurrentDictionary<Guid, DateTimeOffset> entityId_updateTime = new ConcurrentDictionary<Guid, DateTimeOffset>();

        private bool UpdateTime(Guid entityId)
        {
            if (entityId_updateTime.TryGetValue(entityId, out var time))
            {
                return entityId_updateTime.TryUpdate(entityId, DateTimeProvider.Time, time);
            }

            return false;
        }

        public bool IsConsist => entityId_userIds.Count == entityId_updateTime.Count;

        public int CountActiveEntities => entityId_userIds.Count;


        public bool IsContainsId(Guid id) => entityId_userIds.ContainsKey(id);

        public bool IsContainsUserId(Guid id, Guid userId) => entityId_userIds.ContainsKey(id) && entityId_userIds[id].Contains(userId);

        public List<Guid> GetIdsByEntityId(Guid id)
        {
            var isSuccess = entityId_userIds.TryGetValue(id, out var value);
            if (isSuccess)
            {
                return value.ToList();
            }
            return new List<Guid>();
        }

        public bool Add(Guid entityId, Guid userId)
        {
            if (entityId_userIds.TryGetValue(entityId, out var userIds))
            {
                if (!userIds.Contains(userId))
                {
                    try
                    {
                        entityId_userIds[entityId] = userIds.Add(userId);
                        UpdateTime(entityId);
                        return true;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                    }
                }
            }
            else
            {
                var userIdsList = new List<Guid>() { userId };
                var isAddedUser = entityId_userIds.TryAdd(entityId, userIdsList.ToImmutableList());
                var isAddedTime = entityId_updateTime.TryAdd(entityId, DateTimeProvider.Time);
                return isAddedUser && isAddedTime;
            }

            return false;
        }

        public bool Remove(Guid entityId, Guid userId)
        {
            if (!entityId_userIds.TryGetValue(entityId, out var userIds))
            {
                return true;
            }
            else
            {
                if (userIds.Contains(userId))
                {
                    try
                    {
                        entityId_userIds[entityId] = userIds.Remove(userId);
                        UpdateTime(entityId);
                        return true;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                    }
                }
            }

            return false;
        }

        public void ClearEmptyAfterDelay(DateTimeOffset earliestTimestamp)
        {
            var ids = entityId_updateTime.Where(x => x.Value < earliestTimestamp).Select(x => x.Key);
            if (ids.Any())
            {
                var idsToDelete = entityId_userIds.Where(x => ids.Contains(x.Key) && !x.Value.Any()).Select(x => x.Key);
                if (idsToDelete.Any())
                {
                    var idsThatWasDeleted = new List<Guid>();
                    Console.WriteLine("Try to delete next values: ", string.Join(",", idsToDelete));
                    try
                    {
                        foreach (var id in idsToDelete)
                        {
                            bool isRemoved = true;
                            if (!entityId_userIds.ContainsKey(id))
                            {
                                isRemoved = entityId_userIds.TryRemove(id, out var value);
                            }
                            if (isRemoved)
                            {
                                entityId_updateTime.TryRemove(id, out var value);
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
