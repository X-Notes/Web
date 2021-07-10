using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace BI.Services.History
{
    public class CacheHistory {
        public Guid NoteId { set; get; }
        public List<Guid> UsersThatEditIds { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public string AuthorNoteEmail { set; get; }
    }


    public class HistoryCacheService
    {
        public ConcurrentDictionary<Guid, CacheHistory> Ids = new ConcurrentDictionary<Guid, CacheHistory>();

        public HistoryCacheService()
        {
        }
        
        public void UpdateNote(Guid noteId, Guid userId, string Email)
        {
            if (Ids.TryGetValue(noteId, out var cacheHistory))
            {
                if(!cacheHistory.UsersThatEditIds.Contains(userId))
                {
                    cacheHistory.UsersThatEditIds.Add(userId);
                }
                cacheHistory.UpdatedAt = DateTimeOffset.Now;
                Ids[noteId] = cacheHistory;
            }
            else
            {
                var userList = new List<Guid>() { userId };
                var cacheModel = new CacheHistory()
                {
                    UsersThatEditIds = userList,
                    UpdatedAt = DateTimeOffset.Now,
                    NoteId = noteId,
                    AuthorNoteEmail = Email
                };
                Ids.TryAdd(noteId, cacheModel);
            }
        }

        public CacheHistory GetUsersIds(Guid noteId)
        {
            if(Ids.TryGetValue(noteId, out var cacheHistory))
            {
                return cacheHistory;
            }
            return null;
        }


        public List<CacheHistory> GetCacheHistoriesForSnapshotingByTime(int afterSeconds)
        {
            return Ids.Where(x => x.Value.UpdatedAt.AddSeconds(afterSeconds) < DateTimeOffset.Now)
                      .Select(x => x.Value).ToList();
        }

        public void RemoveFromList(List<CacheHistory> histories)
        {
            foreach(var history in histories)
            {
                Ids.Remove(history.NoteId, out var value);
            }
        }


    }
}
