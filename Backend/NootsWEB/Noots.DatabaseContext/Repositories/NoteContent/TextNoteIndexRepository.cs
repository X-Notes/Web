using Common.DatabaseModels.Models.NoteContent.TextContent;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.NoteContent;

public class TextNoteIndexRepository : Repository<TextNoteIndex, Guid>
{
    public TextNoteIndexRepository(NootsDBContext contextDB)
            : base(contextDB)
    {

    }

    public Task<List<TextNoteIndex>> GetTextsNotesAsync(IEnumerable<Guid> noteIds, string searchStr)
    {
        return entities.Where(x => noteIds.Contains(x.NoteId) && x.Content != null && x.Content.ToLower().Contains(searchStr.ToLower())).ToListAsync();
    }
}
