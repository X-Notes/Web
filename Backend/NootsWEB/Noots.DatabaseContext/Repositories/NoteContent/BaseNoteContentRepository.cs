using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.NoteContent
{
    public class BaseNoteContentRepository : Repository<BaseNoteContent, Guid>
    {
        public BaseNoteContentRepository(NootsDBContext contextDB)
            : base(contextDB)
        {

        }

        public Task<List<BaseNoteContent>> GetAllContentByNoteIdOrderedAsync(Guid id)
        {
            return entities
                .Include(x => (x as CollectionNote).Files)
                .Where(x => x.NoteId == id)
                .OrderBy(x => x.Order)
                .AsSplitQuery()
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
