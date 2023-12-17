using Common.DatabaseModels.Models.Notes;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.Notes
{
    public class RelatedNoteToInnerNoteRepository : Repository<RelatedNoteToInnerNote, int>
    {
        public RelatedNoteToInnerNoteRepository(ApiDbContext contextDB)
                : base(contextDB)
        {

        }

        public Task<List<RelatedNoteToInnerNote>> GetByNoteId(Guid noteId)
        {
            return entities.Include(x => x.RelatedNoteUserStates).Where(x => x.NoteId == noteId).ToListAsync();
        }

        public Task<List<RelatedNoteToInnerNote>> GeIncludeRootNoteByRelatedNoteIdsNoTrackingAsync(List<Guid> noteIds)
        {
            return entities
                .Include(x => x.Note)
                .Where(x => noteIds.Contains(x.RelatedNoteId))
                .AsNoTracking()
                .ToListAsync();
        }

        public Task<List<RelatedNoteToInnerNote>> GeIncludeRelatedNoteByNotesIds(IEnumerable<Guid> noteIds)
        {
            return entities
                .Include(x => x.RelatedNote)
                .Where(x => noteIds.Contains(x.NoteId))
                .ToListAsync();
        }
    }
}
