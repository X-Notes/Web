using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent;
using Common.DTO.Notes;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.NoteContent
{
    public class BaseNoteContentRepository : Repository<BaseNoteContent, Guid>
    {
        public BaseNoteContentRepository(ApiDbContext contextDB)
            : base(contextDB)
        {

        }

        public Task<List<Guid>> GetContentIdsByNoteIdAsync(Guid noteId)
        {
            return entities
                .Where(x => x.NoteId == noteId)
                .AsNoTracking()
                .Select(x => x.Id)
                .ToListAsync();
        }

        public Task<List<BaseNoteContent>> GetAllContentByNoteIdOrderedAsync(Guid noteId)
        {
            return entities
                .Include(x => x.Files)
                .Where(x => x.NoteId == noteId)
                .OrderBy(x => x.Order)
                .AsSplitQuery()
                .AsNoTracking()
                .ToListAsync();
        }

        public Task<List<BaseNoteContent>> GetAllContentByNoteIdOrderedAsync(Guid noteId, List<Guid> contentIds)
        {
            return entities
                .Include(x => x.Files)
                .Where(x => x.NoteId == noteId && contentIds.Contains(x.Id))
                .OrderBy(x => x.Order)
                .AsSplitQuery()
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<AppFile>> GetNotesContentsSizesAsync(List<Guid> noteIds)
        {
            return await entities
                .Include(x => x.Files)
                .Where(x => noteIds.Contains(x.NoteId) && x.ContentTypeId == ContentTypeENUM.Collection && x.Files.Count > 0)
                .SelectMany(x => x.Files)
                .ToListAsync();
        }

        public Task<List<BaseNoteContent>> GetUnsyncedTexts(int take)
        {
            return entities.Include(x => x.TextNoteIndex)
                .Where(x => x.TextNoteIndex == null || x.TextNoteIndex.Version != x.Version)
                .Take(take).ToListAsync();
        }

        public Task<List<BaseNoteContent>> GetManyIncludeNoteAppFiles(IEnumerable<Guid> noteIds)
        {
            return entities.Include(x => x.CollectionNoteAppFiles).Where(x => noteIds.Contains(x.NoteId)).ToListAsync();
        }

        public Task<List<BaseNoteContent>> GetManyIncludeFiles(List<Guid> ids)
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