﻿using Common.DatabaseModels.Models.NoteContent.TextContent;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.NoteContent
{
    public class TextNotesRepository : Repository<TextNote, Guid>
    {
        public TextNotesRepository(ApiDbContext contextDB)
            : base(contextDB)
        {

        }

        public Task<List<TextNote>> GetUnsyncedTexts(int take)
        {
            return entities.Include(x => x.TextNoteIndex)
                           .Where(x => x.TextNoteIndex == null || x.TextNoteIndex.Version != x.Version)
                           .Take(take).ToListAsync();
        }
    }
}
