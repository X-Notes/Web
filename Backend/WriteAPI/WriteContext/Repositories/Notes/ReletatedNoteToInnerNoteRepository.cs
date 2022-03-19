using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Notes;
using WriteContext.GenericRepositories;
using Common.DatabaseModels.Models.NoteContent.FileContent;

namespace WriteContext.Repositories.Notes
{
    public class ReletatedNoteToInnerNoteRepository : Repository<ReletatedNoteToInnerNote, Guid>
    {
        public ReletatedNoteToInnerNoteRepository(WriteContextDB contextDB)
                : base(contextDB)
        {

        }

        public Task<List<ReletatedNoteToInnerNote>> GetRelatedNotes(Guid id)
        {
            return context.ReletatedNoteToInnerNotes
                .Where(x => x.NoteId == id).ToListAsync();
        }

        public async Task<List<ReletatedNoteToInnerNote>> GetRelatedNotesFullContent(Guid id)
        {
            var notes = await context.ReletatedNoteToInnerNotes // TODO OPTIMIZATION
                .Where(x => x.NoteId == id)
                .Include(x => x.RelatedNote)
                .ThenInclude(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.RelatedNote)
                .ThenInclude(x => x.Contents)
                .ThenInclude(z => (z as CollectionNote).Files)
                .Include(x => x.RelatedNote)
                .OrderBy(x => x.Order)
                .AsSplitQuery().AsNoTracking().ToListAsync();

            notes.ForEach(x => x.RelatedNote.Contents = x.RelatedNote.Contents.OrderBy(x => x.Order).ToList());
            return notes;
        }

        public Task<List<ReletatedNoteToInnerNote>> GetRelatedNotesOnlyLabels(Guid id)
        {
            return context.ReletatedNoteToInnerNotes
                .Where(x => x.NoteId == id)
                .Include(x => x.RelatedNote)
                .ThenInclude(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .ToListAsync();
        }

        public Task<List<ReletatedNoteToInnerNote>> GetRelatedNotesOnlyRelated(Guid id)
        {
            return context.ReletatedNoteToInnerNotes
                .Where(x => x.NoteId == id)
                .Include(x => x.RelatedNote)
                .ToListAsync();
        }

    }
}
