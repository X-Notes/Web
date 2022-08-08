using Common;
using Common.DatabaseModels.Models.History;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WriteContext.Repositories.Histories;

namespace BI.Services.History
{
    public class HistoryCacheService
    {
        private readonly CacheNoteHistoryRepository cacheNoteHistoryRepository;

        public HistoryCacheService(CacheNoteHistoryRepository cacheNoteHistoryRepository)
        {
            this.cacheNoteHistoryRepository = cacheNoteHistoryRepository;
        }
        
        public async Task UpdateNote(Guid noteId, Guid userId)
        {
            var dbEntity = await cacheNoteHistoryRepository.FirstOrDefaultAsync(x => x.NoteId == noteId);
            if(dbEntity == null)
            {
                var entity = new CacheNoteHistory
                {
                    NoteId = noteId,
                    UpdatedAt = DateTimeProvider.Time,
                    UsersThatEditIds = new HashSet<Guid> { userId }
                };
                await cacheNoteHistoryRepository.AddAsync(entity);
            }
            else
            {
                dbEntity.UpdatedAt = DateTimeProvider.Time;
                dbEntity.UsersThatEditIds = dbEntity.UsersThatEditIds ?? new HashSet<Guid>();
                dbEntity.UsersThatEditIds.Add(userId);
                await cacheNoteHistoryRepository.UpdateAsync(dbEntity); // TODO Prevent simultaneously updating
            }
        }

        public Task<List<CacheNoteHistory>> GetCacheHistoriesForSnapshotingByTime(DateTimeOffset earliestTimestamp)
        {
            return cacheNoteHistoryRepository.GetWhereAsync(x => x.UpdatedAt.HasValue && x.UpdatedAt < earliestTimestamp);
        }

        public async Task RemoveUpdateDates(List<CacheNoteHistory> histories)
        {
            histories.ForEach(x => 
            { 
                x.UpdatedAt = null;
                x.UsersThatEditIds = new HashSet<Guid>();
            });
            await cacheNoteHistoryRepository.UpdateRangeAsync(histories);
        }


    }
}
