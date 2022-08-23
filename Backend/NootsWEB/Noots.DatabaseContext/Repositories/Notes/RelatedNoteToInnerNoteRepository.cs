using Common.DatabaseModels.Models.Notes;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Notes
{
    public class RelatedNoteToInnerNoteRepository : Repository<RelatedNoteToInnerNote, int>
    {
        public RelatedNoteToInnerNoteRepository(NootsDBContext contextDB)
                : base(contextDB)
        {

        }

        public Task<List<RelatedNoteToInnerNote>> GetByNoteId(Guid noteId)
        {
            return entities.Include(x => x.RelatedNoteUserStates).Where(x => x.NoteId == noteId).ToListAsync();
        }
    }
}
