using Common.DatabaseModels.models.NoteContent;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class TextNotesRepository : Repository<TextNote>
    {
        public TextNotesRepository(WriteContextDB contextDB)
            : base(contextDB)
        {

        }

        public async Task<List<TextNote>> GetAllTextContentByNoteIdOrdered(Guid id)
        {
            return await entities
                .Where(x => x.NoteId == id)
                .OrderBy(x => x.Order)
                .ToListAsync();
        }
    }
}
