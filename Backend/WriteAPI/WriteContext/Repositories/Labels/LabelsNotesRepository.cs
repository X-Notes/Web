using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Labels;
using Microsoft.EntityFrameworkCore;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Labels
{
    public class LabelsNotesRepository : Repository<LabelsNotes, Guid>
    {
        public LabelsNotesRepository(WriteContextDB contextDB)
            : base(contextDB)
        {

        }

        public async Task<List<LabelsNotes>> GetLabelsAsync(Guid noteId)
        {
            return await entities
                .Include(x => x.Label)
                .Where(x => x.NoteId == noteId).ToListAsync();
        }

        public async Task<List<LabelsNotes>> GetLabelsAsync(IEnumerable<Guid> noteIds)
        {
            return await entities
                .Include(x => x.Label)
                .Where(x => noteIds.Contains(x.NoteId)).ToListAsync();
        }
    }
}
