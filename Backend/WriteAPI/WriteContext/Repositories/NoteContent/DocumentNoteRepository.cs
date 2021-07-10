using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent;
using Microsoft.EntityFrameworkCore;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class DocumentNoteRepository : Repository<DocumentNote, Guid>
    {
        public DocumentNoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }

        public async Task<List<Guid>> GroupByContainsIds(IEnumerable<Guid> ids)
        {
            return await entities.Where(x => ids.Contains(x.AppFileId))
                .GroupBy(x => x.AppFileId).Select(x => x.Key).ToListAsync();
        }
    }
}
