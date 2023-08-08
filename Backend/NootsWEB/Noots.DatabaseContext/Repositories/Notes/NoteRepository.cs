using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.Notes;
using Common.DTO.Personalization;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Notes
{
    public class NoteRepository : Repository<Note, Guid>
    {
        public NoteRepository(NootsDBContext contextDB)
            : base(contextDB)
        {
        }

        public Task<List<Note>> GetNotesThatNeedDeleteAfterTime(DateTimeOffset earliestTimestamp)
        {
            return entities.Where(x => x.NoteTypeId == NoteTypeENUM.Deleted && x.DeletedAt.HasValue && x.DeletedAt.Value < earliestTimestamp).ToListAsync();
        }

        public Task<Note?> GetForCheckPermission(Guid id)
        {
            return context.Notes
                .Include(x => x.UsersOnPrivateNotes)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task<List<Note>> GetForCheckPermissions(List<Guid> ids)
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


        private List<ContentTypeENUM> GetFilterTypes(PersonalizationSettingDTO settings)
        {
            var types = new List<ContentTypeENUM>();

            if (settings.IsViewTextOnNote)
            {
                types.Add(ContentTypeENUM.Text);
            }

            if (settings.IsViewPhotosOnNote || settings.IsViewVideoOnNote || settings.IsViewAudioOnNote || settings.IsViewDocumentOnNote)
            {
                types.Add(ContentTypeENUM.Collection);
            }

            return types;
        }


        private async Task<List<Note>> GetWithFilteredContent(List<Note> notes, PersonalizationSettingDTO settings)
        {
            settings = settings ?? new PersonalizationSettingDTO().GetDefault();

            var types = GetFilterTypes(settings);
            var collectionTypes = settings.GetFileTypes();

            var notesIds = notes.Select(q => q.Id).ToHashSet();

            var query = context.BaseNoteContents
                .Include(q => (q as CollectionNote).Files)
                .Where(q => notesIds.Contains(q.NoteId) && q.ContentTypeId == ContentTypeENUM.Collection ? collectionTypes.Contains((q as CollectionNote).FileTypeId) : true)
                .AsSplitQuery().GroupBy(x => x.NoteId).Select(x => new { noteId = x.Key, contents = x.OrderBy(q => q.Order).Take(settings.ContentInNoteCount).ToList() });

 
            var contentsDict = await query.ToDictionaryAsync(x => x.noteId);

            notes.ForEach(note =>
            {
                if (contentsDict.ContainsKey(note.Id)) {
                    note.Contents = contentsDict[note.Id].contents;
                }
            });

            return notes;
        }


        public async Task<List<Note>> GetNotesByUserIdAndTypeIdWithContent(
            Guid userId, NoteTypeENUM typeId, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                    .Include(x => x.LabelsNotes).ThenInclude(q => q.Label)
                    .Where(x => x.UserId == userId && x.NoteTypeId == typeId)
                    .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
        }

        public async Task<List<Note>> GetNotesByNoteIdsIdWithContent(
            IEnumerable<Guid> noteIds, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                    .Include(x => x.LabelsNotes).ThenInclude(q => q.Label)
                    .Include(x => x.UsersOnPrivateNotes)
                    .Where(x => noteIds.Contains(x.Id))
                    .AsSplitQuery()
                    .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
        }

        public async Task<List<Note>> GetNotesByUserId(Guid userId, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(q => q.Label)
                .Include(x => x.UsersOnPrivateNotes)
                .Where(x => x.UserId == userId)
                .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
        }

        public async Task<List<Note>> GetNotesByUserIdNoLockedWithoutDeleted(Guid userId, List<Guid> exceptIds, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(q => q.Label)
                .Where(x => x.UserId == userId && !exceptIds.Contains(x.Id) && x.NoteTypeId != NoteTypeENUM.Deleted)
                .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
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

        public Task<List<Note>> GetNotesWithContent(List<Guid> noteIds)
        { 
            return entities  // TODO OPTIMIZATION
                .Include(x => x.LabelsNotes).ThenInclude(q => q.Label)
                .Include(x => x.Contents)
                    .ThenInclude(q => (q as CollectionNote).CollectionNoteAppFiles)
                .Include(x => x.Contents)
                    .ThenInclude(q => (q as CollectionNote).Files)
                .Where(x => noteIds.Contains(x.Id))
                .AsSplitQuery()
                .ToListAsync();
        }

        public Task<List<Note>> GetNotesIncludeCollectionNoteAppFiles(List<Guid> noteIds)
        {
            return entities  // TODO OPTIMIZATION
                .Include(x => x.Contents)
                    .ThenInclude(q => (q as CollectionNote).Files)
                .Where(x => noteIds.Contains(x.Id))
                .AsSplitQuery()
                .ToListAsync();
        }

        public Task<Note?> GetNoteWithContent(Guid noteId)
        {
            return entities  // TODO OPTIMIZATION
                .Include(x => x.LabelsNotes)
                    .ThenInclude(q => q.Label)
                .Include(x => x.Contents)
                    .ThenInclude(q => (q as CollectionNote).CollectionNoteAppFiles)
                .Include(x => x.Contents)
                    .ThenInclude(q => (q as CollectionNote).Files)
                .AsSplitQuery()
                .FirstOrDefaultAsync(x => x.Id == noteId);
        }

        public Task<Note?> GetNoteWithContentAsNoTracking(Guid noteId)
        {
            return entities  // TODO OPTIMIZATION
                .Include(x => x.LabelsNotes)
                    .ThenInclude(q => q.Label)
                .Include(x => x.Contents)
                    .ThenInclude(q => (q as CollectionNote).CollectionNoteAppFiles)
                .Include(x => x.Contents)
                    .ThenInclude(q => (q as CollectionNote).Files)
                .AsSplitQuery()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == noteId);
        }
    }
}
