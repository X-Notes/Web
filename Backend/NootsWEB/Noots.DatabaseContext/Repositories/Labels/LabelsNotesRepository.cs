﻿using Common.DatabaseModels.Models.Labels;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Labels
{
    public class LabelsNotesRepository : Repository<LabelsNotes, Guid>
    {
        public LabelsNotesRepository(NootsDBContext contextDB)
            : base(contextDB)
        {

        }

        public Task<List<LabelsNotes>> GetLabelsAsync(Guid noteId)
        {
            return entities
                .Include(x => x.Label)
                .Where(x => x.NoteId == noteId).ToListAsync();
        }

        public Task<List<LabelsNotes>> GetLabelsAsync(IEnumerable<Guid> noteIds)
        {
            return entities
                .Include(x => x.Label)
                .Where(x => noteIds.Contains(x.NoteId)).ToListAsync();
        }
    }
}