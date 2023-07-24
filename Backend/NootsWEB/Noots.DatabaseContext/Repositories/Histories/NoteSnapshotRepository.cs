using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.History;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Histories
{
    public class NoteSnapshotRepository : Repository<NoteSnapshot, Guid>
    {
        public NoteSnapshotRepository(NootsDBContext contextDB)
        : base(contextDB)
        {

        }

        public Task<List<NoteSnapshot>> GetNoteHistories(Guid noteId)
        {
            return entities.Where(x => x.NoteId == noteId)
                .Include(x => x.Users)
                .ThenInclude(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .OrderByDescending(x => x.SnapshotTime)
                .AsSplitQuery()
                .ToListAsync();
        }
        
        
        public Task<List<NoteSnapshot>> GetNoteHistories(Guid noteId, DateTimeOffset earliestTimestamp)
        {
            return entities.Where(x => x.NoteId == noteId)
                .Include(x => x.Users)
                .ThenInclude(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .OrderByDescending(x => x.SnapshotTime)
                .Where(x => x.SnapshotTime > earliestTimestamp)
                .AsSplitQuery()
                .ToListAsync();
        }

        public Task<List<NoteSnapshot>> GetSnapshotsThatNeedDeleteAfterTime(DateTimeOffset earliestTimestamp)
        {
            return entities.Where(x => x.SnapshotTime < earliestTimestamp).ToListAsync();
        }

        public Task<List<NoteSnapshot>> GetSnapshotsWithSnapshotFileContent(IEnumerable<Guid> noteIds)
        {
            return entities.Include(x => x.SnapshotFileContents).Where(x => noteIds.Contains(x.NoteId)).ToListAsync();
        }

        public async Task<Dictionary<Guid, (Guid, IEnumerable<AppFile>)>> GetMemoryOfNotesSnapshots(List<Guid> ids)
        {
            var ents = await entities
                         .Where(x => ids.Contains(x.NoteId))
                         .Include(x => x.AppFiles)
                         .GroupBy(x => x.NoteId)
                         .Select( x => new { noteId = x.Key, files = x.SelectMany(q => q.AppFiles) })
                         .ToListAsync();

            return ents.Select(x => (x.noteId, x.files)).ToDictionary(x => x.noteId);
        }
    }
}
