using Common.DatabaseModels.Models.Notes;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Notes
{
    public class ReletatedNoteToInnerNoteRepository : Repository<ReletatedNoteToInnerNote, int>
    {
        public ReletatedNoteToInnerNoteRepository(NootsDBContext contextDB)
                : base(contextDB)
        {

        }

        public Task<List<ReletatedNoteToInnerNote>> GetByNoteId(Guid noteId)
        {
            return entities.Include(x => x.RelatedNoteUserStates).Where(x => x.NoteId == noteId).ToListAsync();
        }
    }
}
