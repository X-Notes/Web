﻿using Common.DatabaseModels.Models.Notes;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Notes
{
    public class RelatedNoteToInnerNoteRepository : Repository<RelatedNoteToInnerNote, int>
    {
        public RelatedNoteToInnerNoteRepository(NootsDBContext contextDB)
                : base(contextDB)
        {

        }

        public Task<List<RelatedNoteToInnerNote>> GetByNoteId(Guid noteId)
        {
            return entities.Include(x => x.RelatedNoteUserStates).Where(x => x.NoteId == noteId).ToListAsync();
        }

        public Task<List<RelatedNoteToInnerNote>> GeIncludeRootNoteByRelatedNoteIds(List<Guid> noteIds)
        {
            return entities
                .Include(x => x.Note)
                .Where(x => noteIds.Contains(x.RelatedNoteId))
                .ToListAsync();
        }

        public Task<List<RelatedNoteToInnerNote>> GeIncludeRelatedNoteByNotesIds(IEnumerable<Guid> noteIds)
        {
            return entities
                .Include(x => x.RelatedNote)
                .Where(x => noteIds.Contains(x.NoteId))
                .ToListAsync();
        }
    }
}
