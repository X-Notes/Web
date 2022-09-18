using Common.DatabaseModels.Models.NoteContent.TextContent;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.NoteContent
{
    public class TextNotesRepository : Repository<TextNote, Guid>
    {
        public TextNotesRepository(NootsDBContext contextDB)
            : base(contextDB)
        {

        }

        public Task<List<TextNote>> GetAllTextContentByNoteIdOrdered(Guid id)
        {
            return entities
                .Where(x => x.NoteId == id)
                .OrderBy(x => x.Order)
                .ToListAsync();
        }
    }
}
