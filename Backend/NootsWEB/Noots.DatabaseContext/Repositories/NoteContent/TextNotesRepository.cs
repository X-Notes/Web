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

        public Task<List<TextNote>> GetUnsyncedTexts(int take)
        {
            return entities.Include(x => x.TextNoteIndex)
                           .Where(x => x.TextNoteIndex == null || x.TextNoteIndex.Version != x.Version)
                           .Take(take).ToListAsync();
        }
    }
}
