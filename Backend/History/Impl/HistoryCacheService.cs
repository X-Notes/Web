using Common;
using Common.Channels;
using Common.DatabaseModels.Models.History;
using Common.DTO.History;
using DatabaseContext.Repositories.Histories;

namespace History.Impl;

public class HistoryCacheService
{
    private readonly CacheNoteHistoryRepository cacheNoteHistoryRepository;

    public HistoryCacheService(CacheNoteHistoryRepository cacheNoteHistoryRepository)
    {
        this.cacheNoteHistoryRepository = cacheNoteHistoryRepository;
    }


    public async Task ProcessChangeAsync(NoteHistoryChange ent)
    {
        var dbEntity = await cacheNoteHistoryRepository.FirstOrDefaultAsync(x => x.NoteId == ent.NoteId);
        if (dbEntity == null)
        {
            var entity = new CacheNoteHistory
            {
                NoteId = ent.NoteId,
                UpdatedAt = DateTimeProvider.Time,
            };
            entity.UpdateUsersThatEditIds(new HashSet<Guid> { ent.UserId });
            await cacheNoteHistoryRepository.AddAsync(entity);
        }
        else
        {
            dbEntity.UpdatedAt = DateTimeProvider.Time;
            var usersThatEditIds = dbEntity.GetUsersThatEditIds() ?? new HashSet<Guid>();
            usersThatEditIds.Add(ent.UserId);
            dbEntity.UpdateUsersThatEditIds(usersThatEditIds);
            await cacheNoteHistoryRepository.UpdateAsync(dbEntity);
        }
    }

    public async Task UpdateNoteAsync(Guid noteId, Guid userId) 
    {
        await ChannelsService.HistoryChannel.Writer.WriteAsync(new NoteHistoryChange { NoteId = noteId, UserId = userId });
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
            x.UsersThatEditIds = null;
        });
        await cacheNoteHistoryRepository.UpdateRangeAsync(histories);
    }

}
