using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.Notes;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.Notes
{
    public class NoteRepository : Repository<Note, Guid>
    {
        public NoteRepository(ApiDbContext contextDB)
            : base(contextDB)
        {
        }

        public Task<List<Note>> GetNotesThatNeedDeleteAfterTime(DateTimeOffset earliestTimestamp)
        {
            return entities.Where(x => x.NoteTypeId == NoteTypeENUM.Deleted && x.DeletedAt.HasValue && x.DeletedAt.Value < earliestTimestamp).ToListAsync();
        }

        public Task<Note?> GetNoteIncludeUsersAsync(Guid id)
        {
            return context.Notes
                .Include(x => x.UsersOnPrivateNotes)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task<List<Note>> GetNotesIncludeUsersAsync(List<Guid> ids)
        {
            return context.Notes
                .Include(x => x.UsersOnPrivateNotes)
                .Where(x => ids.Contains(x.Id)).ToListAsync();
        }

        public Task<Note?> GetNoteWithLabels(Guid id)
        {
            return context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(q => q.Label)
                .FirstOrDefaultAsync(x => x.Id == id);
        }
        
        private async Task<List<Note>> GetWithFilteredContent(List<Note> notes, int takeContents)
        {
            if (takeContents == 0)
            {
                return notes;
            }
            
            var notesIds = notes.Select(q => q.Id).ToHashSet();

            if (notesIds.Count == 0)
            {
                return notes;
            }

            if (takeContents > PersonalizationConstants.maxContentInNoteCount)
            {
                takeContents = PersonalizationConstants.maxContentInNoteCount;
            }
            
            var query = context.BaseNoteContents
                .Include(q => q.Files)
                .Where(q => notesIds.Contains(q.NoteId) && q.Order <= takeContents)
                .GroupBy(x => x.NoteId)                
                .Select(x => new { noteId = x.Key, contents = x.OrderBy(q => q.Order).ToList() });
                
            var contentsDict = await query.ToDictionaryAsync(x => x.noteId);
            notes.ForEach(note =>
            {
                if (contentsDict.TryGetValue(note.Id, out var value)) {
                    note.Contents = value.contents.ToList();
                }
            });

            return notes;
        }
        
        public async Task<List<Note>> GetNotesByUserIdAndTypeIdWithContent(
            Guid userId, NoteTypeENUM typeId, int takeContents)
        {
            var notes = await context.Notes
                    .Include(x => x.LabelsNotes).ThenInclude(q => q.Label)
                    .Where(x => x.UserId == userId && x.NoteTypeId == typeId)
                    .ToListAsync();

            return await GetWithFilteredContent(notes, takeContents);
        }

        public async Task<List<Note>> GetNotesByNoteIdsIdWithContent(
            IEnumerable<Guid> noteIds, int takeContents)
        {
            var notes = await context.Notes
                    .Include(x => x.LabelsNotes).ThenInclude(q => q.Label)
                    .Include(x => x.UsersOnPrivateNotes)
                    .Where(x => noteIds.Contains(x.Id))
                    .AsSplitQuery()
                    .ToListAsync();

            return await GetWithFilteredContent(notes, takeContents);
        }

        public async Task<List<NotesCount>> GetNotesCountAsync(Guid userId)
        {
            return await context.Notes
                .Where(x => x.UserId == userId)
                .GroupBy(x => x.NoteTypeId).Select(x => new NotesCount()
            {
                NoteTypeId = x.Key,
                Count = x.Count()
            }).AsNoTracking().ToListAsync();
        }

        public async Task<List<Note>> GetNotesByUserId(Guid userId, int takeContents)
        {
            var notes = await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(q => q.Label)
                .Include(x => x.UsersOnPrivateNotes)
                .Where(x => x.UserId == userId)
                .ToListAsync();

            return await GetWithFilteredContent(notes, takeContents);
        }

        public async Task<List<Note>> GetNotesByUserIdNoLockedWithoutDeleted(Guid userId, List<Guid> exceptIds, int takeContents)
        {
            var notes = await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(q => q.Label)
                .Where(x => x.UserId == userId && !exceptIds.Contains(x.Id) && x.NoteTypeId != NoteTypeENUM.Deleted)
                .ToListAsync();

            return await GetWithFilteredContent(notes, takeContents);
        }

        public Task<List<Guid>> GetNoteIdsNoDeleted(Guid userId, Guid noteId)
        {
           return entities.Where(x => x.UserId == userId && x.Id != noteId && x.NoteTypeId != NoteTypeENUM.Deleted)
                .Select(x => x.Id)
                .ToListAsync();
        }

        public Task<List<Guid>> GetNoteIdsNoDeleted(Guid userId, List<Guid> exceptIds)
        {
            return entities.Where(x => x.UserId == userId && !exceptIds.Contains(x.Id) && x.NoteTypeId != NoteTypeENUM.Deleted)
                .Select(x => x.Id)
                .ToListAsync();
        }

        public Task<List<Guid>> GetNoteIdsNoDeleted(List<Guid> noteIds)
        {
            return entities.Where(x => noteIds.Contains(x.Id) && x.NoteTypeId != NoteTypeENUM.Deleted)
                .Select(x => x.Id)
                .ToListAsync();
        }
        
        public Task<Note?> GetNoteWithContent(Guid noteId)
        {
            return entities  // TODO OPTIMIZATION
                .Include(x => x.LabelsNotes)
                    .ThenInclude(q => q.Label)
                .Include(x => x.Contents)
                    .ThenInclude(q => q.CollectionNoteAppFiles)
                .Include(x => x.Contents)
                    .ThenInclude(q => q.Files)
                .AsSplitQuery()
                .FirstOrDefaultAsync(x => x.Id == noteId);
        }

        public Task<Note?> GetNoteWithContentAsNoTracking(Guid noteId)
        {
            return entities  // TODO OPTIMIZATION
                .Include(x => x.LabelsNotes)
                    .ThenInclude(q => q.Label)
                .Include(x => x.Contents)
                    .ThenInclude(q => q.CollectionNoteAppFiles)
                .Include(x => x.Contents)
                    .ThenInclude(q => q.Files)
                .AsSplitQuery()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == noteId);
        }
    }
}
