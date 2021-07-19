using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.History;
using WriteContext.GenericRepositories;
using Common.DatabaseModels.Models.Notes;

namespace WriteContext.Repositories.Histories
{
    public class NoteSnapshotRepository : Repository<NoteSnapshot, Guid>
    {
        public NoteSnapshotRepository(WriteContextDB contextDB)
        : base(contextDB)
        {

        }


        public async Task<List<NoteSnapshot>> GetNoteHistories(Guid noteId)
        {
            return await entities.Where(x => x.NoteId == noteId)
                .Include(x => x.Users)
                .ThenInclude(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .OrderByDescending(x => x.SnapshotTime).ToListAsync();
        }

    }
}
