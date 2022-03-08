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

        public async Task<List<ReletatedNoteToInnerNote>> GetRelatedNotes(Guid id)
        {
            return await context.ReletatedNoteToInnerNotes
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
                .ThenInclude(z => (z as PhotosCollectionNote).Photos)
                .Include(x => x.RelatedNote)
                .ThenInclude(x => x.Contents)
                .ThenInclude(x => (x as VideosCollectionNote).Videos)
                .Include(x => x.RelatedNote)
                .ThenInclude(x => x.Contents)
                .ThenInclude(x => (x as AudiosCollectionNote).Audios)
                .Include(x => x.RelatedNote)
                .ThenInclude(x => x.Contents)
                .ThenInclude(x => (x as DocumentsCollectionNote).Documents)
                .OrderBy(x => x.Order)
                .AsSplitQuery().AsNoTracking().ToListAsync();

            notes.ForEach(x => x.RelatedNote.Contents = x.RelatedNote.Contents.OrderBy(x => x.Order).ToList());
            return notes;
        }

        public async Task<List<ReletatedNoteToInnerNote>> GetRelatedNotesOnlyLabels(Guid id)
        {
            return await context.ReletatedNoteToInnerNotes
                .Where(x => x.NoteId == id)
                .Include(x => x.RelatedNote)
                .ThenInclude(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .ToListAsync();
        }

        public async Task<List<ReletatedNoteToInnerNote>> GetRelatedNotesOnlyRelated(Guid id)
        {
            return await context.ReletatedNoteToInnerNotes
                .Where(x => x.NoteId == id)
                .Include(x => x.RelatedNote)
                .ToListAsync();
        }

    }
}
