using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.History;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Histories
{
    public class NoteSnapshotRepository : Repository<NoteSnapshot, Guid>
    {
        public NoteSnapshotRepository(WriteContextDB contextDB)
        : base(contextDB)
        {

        }

        public Task<List<NoteSnapshot>> GetNoteHistories(Guid noteId)
        {
            return entities.Where(x => x.NoteId == noteId)
                .Include(x => x.Users)
                .ThenInclude(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .OrderByDescending(x => x.SnapshotTime).ToListAsync();
        }

        public Task<List<NoteSnapshot>> GetSnapshotsThatNeedDeleteAfterTime(DateTimeOffset earliestTimestamp)
        {
            return entities.Where(x => x.SnapshotTime < earliestTimestamp).ToListAsync();
        }

        public async Task<Dictionary<Guid, (Guid, long)>> GetMemoryOfNotesSnapshots(List<Guid> ids)
        {
            var ents = await entities.Where(x => ids.Contains(x.NoteId))
                                     .Include(x => x.AppFiles)
                                     .GroupBy(x => x.NoteId)
                                     .Select(x => new { noteId = x.Key, size = x.Sum(q => q.AppFiles.Sum(x => x.Size)) })
                                     .ToListAsync();
            return ents.Select(x => (x.noteId, x.size)).ToDictionary(x => x.noteId);
        }
    }
}
