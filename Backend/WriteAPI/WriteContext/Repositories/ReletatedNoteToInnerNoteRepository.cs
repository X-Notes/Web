using Common.DatabaseModels.models;
using Common.DatabaseModels.models.NoteContent;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class ReletatedNoteToInnerNoteRepository : Repository<ReletatedNoteToInnerNote>
    {
        public ReletatedNoteToInnerNoteRepository(WriteContextDB contextDB)
                : base(contextDB)
        {

        }

        public async Task<List<ReletatedNoteToInnerNote>> GetRelatedNotes(Guid id)
        {
            return await context.ReletatedNoteToInnerNotes
                .Where(x => x.NoteId == id).ToListAsync();
        }

        public async Task<List<ReletatedNoteToInnerNote>> GetRelatedNotesFullContent(Guid id)
        {
            return await context.ReletatedNoteToInnerNotes
                .Where(x => x.NoteId == id)
                .Include(x => x.RelatedNote)
                .ThenInclude(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.RelatedNote)
                .ThenInclude(x => x.Contents).ThenInclude(z => (z as AlbumNote).Photos)
                .ToListAsync();
        }

        public async Task<List<ReletatedNoteToInnerNote>> GetRelatedNotesOnlyLabels(Guid id)
        {
            return await context.ReletatedNoteToInnerNotes
                .Where(x => x.NoteId == id)
                .Include(x => x.RelatedNote)
                .ThenInclude(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .ToListAsync();
        }

    }
}
