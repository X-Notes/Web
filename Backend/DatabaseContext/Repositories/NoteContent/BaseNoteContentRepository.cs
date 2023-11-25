using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.NoteContent
{
    public class BaseNoteContentRepository : Repository<BaseNoteContent, Guid>
    {
        public BaseNoteContentRepository(ApiDbContext contextDB)
            : base(contextDB)
        {

        }

        public Task<List<BaseNoteContent>> GetAllContentByNoteIdOrderedAsync(Guid noteId)
        {
            return entities
                .Include(x => (x as CollectionNote).Files)
                .Where(x => x.NoteId == noteId)
                .OrderBy(x => x.Order)
                .AsSplitQuery()
                .AsNoTracking()
                .ToListAsync();
        }

        public Task<List<BaseNoteContent>> GetAllContentByNoteIdOrderedAsync(Guid noteId, List<Guid> contentIds)
        {
            return entities
                .Include(x => (x as CollectionNote).Files)
                .Where(x => x.NoteId == noteId && contentIds.Contains(x.Id))
                .OrderBy(x => x.Order)
                .AsSplitQuery()
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
