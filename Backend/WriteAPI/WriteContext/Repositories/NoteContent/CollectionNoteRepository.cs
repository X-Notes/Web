using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Microsoft.EntityFrameworkCore;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class CollectionNoteRepository : Repository<CollectionNote, Guid>
    {
        public CollectionNoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }


        public Task<CollectionNote> GetOneIncludeNoteAppFiles(Guid id)
        {
            return entities.Include(x => x.CollectionNoteAppFiles).FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task<CollectionNote> GetOneIncludeFiles(Guid id)
        {
            return entities.Include(x => x.Files).FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task<List<CollectionNote>> GetManyIncludeNoteAppFiles(List<Guid> ids)
        {
            return entities.Include(x => x.CollectionNoteAppFiles).Where(x => ids.Contains(x.Id)).ToListAsync();
        }

        public Task<List<CollectionNote>> GetManyIncludeFiles(List<Guid> ids)
        {
            return entities.Include(x => x.Files).Where(x => ids.Contains(x.Id)).ToListAsync();
        }

        public async Task<Dictionary<Guid, (Guid, IEnumerable<AppFile>)>> GetMemoryOfNotes(List<Guid> ids)
        {
            var ents = await entities.Where(x => ids.Contains(x.NoteId))
                                     .Include(x => x.Files)
                                     .GroupBy(x => x.NoteId)
                                     .Select(x => new { noteId = x.Key, files = x.SelectMany(q => q.Files) })
                                     .ToListAsync();

            return ents.Select(x => (x.noteId, x.files)).ToDictionary(x => x.noteId);
        }
    }
}
