using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class TextNotesRepository : Repository<TextNote, Guid>
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
