using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;
using Common.DatabaseModels.Models.NoteContent.TextContent;

namespace WriteContext.Repositories.NoteContent
{
    public class TextNotesRepository : Repository<TextNote, Guid>
    {
        public TextNotesRepository(WriteContextDB contextDB)
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
