using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.NoteContent
{
    public class CollectionNoteRepository : Repository<CollectionNote, Guid>
    {
        public CollectionNoteRepository(NootsDBContext contextDB)
            : base(contextDB)
        {
        }


        public Task<List<CollectionNote>> GetManyIncludeNoteAppFiles(IEnumerable<Guid> noteIds)
        {
            return entities.Include(x => x.CollectionNoteAppFiles).Where(x => noteIds.Contains(x.NoteId)).ToListAsync();
        }

        public Task<List<CollectionNote>> GetManyIncludeFiles(List<Guid> ids)
        {
            return entities.Include(x => x.Files).Where(x => ids.Contains(x.Id)).ToListAsync();
        }

        public async Task<Dictionary<Guid, (Guid, IEnumerable<AppFile>)>> GetMemoryOfNotes(List<Guid> noteIds)
        {
            var ents = await entities.Where(x => noteIds.Contains(x.NoteId))
                                     .Include(x => x.Files)
                                     .GroupBy(x => x.NoteId)
                                     .Select(x => new { noteId = x.Key, files = x.SelectMany(q => q.Files) })
                                     .ToListAsync();

            return ents.Select(x => (x.noteId, x.files)).ToDictionary(x => x.noteId);
        }
    }
}
