using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent;
using WriteContext.GenericRepositories;
using Common.DatabaseModels.Models.NoteContent.FileContent;

namespace WriteContext.Repositories.NoteContent
{
    public class BaseNoteContentRepository : Repository<BaseNoteContent, Guid>
    {
        public BaseNoteContentRepository(WriteContextDB contextDB)
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
