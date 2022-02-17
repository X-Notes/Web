using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.Notes;
using Common.DTO.Personalization;
using WriteContext.GenericRepositories;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common;
using Common.DatabaseModels.Models.NoteContent.TextContent;

namespace WriteContext.Repositories.Notes
{
    public class NoteRepository : Repository<Note, Guid>
    {
        public NoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }

        public async Task Add(Note note, NoteTypeENUM TypeId)
        {
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    var notes = await context.Notes.Where(x => x.UserId == note.UserId && x.NoteTypeId == TypeId).ToListAsync();

                    if (notes.Count() > 0)
                    {
                        notes.ForEach(x => x.Order = x.Order + 1);
                        await UpdateRangeAsync(notes);
                    }

                    await context.Notes.AddAsync(note);
                    await context.SaveChangesAsync();

                    await transaction.CommitAsync();

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    await transaction.RollbackAsync();
                }
            }
        }

        public async Task<List<Note>> GetNotesThatNeedDeleteAfterTime(DateTimeOffset earliestTimestamp)
        {
            return await entities.Where(x => x.NoteTypeId == NoteTypeENUM.Deleted && x.DeletedAt.HasValue && x.DeletedAt.Value < earliestTimestamp).ToListAsync();
        }

        public async Task<Note> GetForCheckPermission(Guid id)
        {
            return await context.Notes
                .Include(x => x.User)
                .Include(x => x.UsersOnPrivateNotes)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Note>> GetForCheckPermissions(List<Guid> ids)
        {
            return await context.Notes
                .Include(x => x.User)
                .Include(x => x.UsersOnPrivateNotes)
                .Where(x => ids.Contains(x.Id)).ToListAsync();
        }


        public async Task<Note> GetFull(Guid id)
        {
            return await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .FirstOrDefaultAsync(x => x.Id == id);
        }


        private List<int> GetFilterTypes(PersonalizationSettingDTO settings)
        {
            var types = new List<int>();

            if (settings.IsViewTextOnNote)
            {
                types.Add((int)ContentTypeENUM.Text);
            }

            if (settings.IsViewPhotosOnNote)
            {
                types.Add((int)ContentTypeENUM.PhotosCollection);
            }

            if (settings.IsViewVideoOnNote)
            {
                types.Add((int)ContentTypeENUM.VideosCollection);
            }

            if (settings.IsViewAudioOnNote)
            {
                types.Add((int)ContentTypeENUM.AudiosCollection);
            }

            if (settings.IsViewDocumentOnNote)
            {
                types.Add((int)ContentTypeENUM.DocumentsCollection);
            }
            return types;
        }


        private async Task<List<Note>> GetWithFilteredContent(List<Note> notes, PersonalizationSettingDTO settings)
        {
            var types = GetFilterTypes(settings);

            var notesIds = notes.Select(z => z.Id).ToHashSet();

            var contents = await context.BaseNoteContents // TODO OPTIMIZATION
                .Where(z => types.Contains((int)z.ContentTypeId) && notesIds.Contains(z.NoteId))
                .Include(z => (z as PhotosCollectionNote).Photos)
                .Include(x => (x as VideosCollectionNote).Videos)
                .Include(x => (x as AudiosCollectionNote).Audios)
                .Include(x => (x as DocumentsCollectionNote).Documents).AsSplitQuery().AsNoTracking().ToListAsync();

            var contentLookUp = contents.ToLookup(x => x.NoteId);
            notes.ForEach(note =>
            {
                SetListIdIfNeed(contentLookUp[note.Id]);
                var baseContent = contentLookUp[note.Id].Where(x => x.ContentTypeId != ContentTypeENUM.Text || (x.ContentTypeId == ContentTypeENUM.Text && (x as TextNote).Contents?.Count > 0));
                var content = baseContent.OrderBy(z => z.Order).Take(settings.ContentInNoteCount).ToList();
                note.Contents = content;
            });

            return notes;
        }

        private void SetListIdIfNeed(IEnumerable<BaseNoteContent> contents)
        {
            var listId = 1;
            foreach(var content in contents.OrderBy(z => z.Order).ToList())
            {
                if(content.ContentTypeId == ContentTypeENUM.Text)
                {
                    var text = content as TextNote;
                    if(text.NoteTextTypeId == NoteTextTypeENUM.Numberlist)
                    {
                        text.ListId = listId;
                    }
                    else
                    {
                        listId++;
                    }
                }
            }
        }

        public async Task<List<Note>> GetNotesByUserIdAndTypeIdWithContentWithPersonalization(
            Guid userId, NoteTypeENUM typeId, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                    .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                    .Where(x => x.UserId == userId && x.NoteTypeId == typeId)
                    .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
        }

        public async Task<List<Note>> GetNotesByNoteIdsIdWithContentWithPersonalization(
            IEnumerable<Guid> noteIds, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                    .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                    .Where(x => noteIds.Contains(x.Id))
                    .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
        }

        public async Task<List<Note>> GetNotesByUserId(Guid userId, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Where(x => x.UserId == userId)
                .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
        }

        public async Task<List<Note>> GetNotesByUserIdWithoutNote(Guid userId, Guid noteId, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Where(x => x.UserId == userId && x.Id != noteId)
                .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
        }


        public async Task<List<Note>> GetNotesByIdsForCopy(List<Guid> noteIds)
        { 
            return await entities  // TODO OPTIMIZATION
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as PhotosCollectionNote).PhotoNoteAppFiles)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as PhotosCollectionNote).Photos)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as AudiosCollectionNote).AudioNoteAppFiles)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as AudiosCollectionNote).Audios)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as VideosCollectionNote).Videos)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as DocumentsCollectionNote).Documents)
                .Where(x => noteIds.Contains(x.Id)).ToListAsync();
        }

        public async Task<Note> GetNoteByIdsForCopy(Guid noteId)
        {
            return await entities  // TODO OPTIMIZATION
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as PhotosCollectionNote).PhotoNoteAppFiles)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as PhotosCollectionNote).Photos)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as AudiosCollectionNote).AudioNoteAppFiles)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as AudiosCollectionNote).Audios)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as VideosCollectionNote).Videos)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as DocumentsCollectionNote).Documents)
                .FirstOrDefaultAsync(x => x.Id == noteId);
        }



        // UPPER MENU FUNCTIONS

        public async Task DeleteRangeDeleted(List<Note> selectdeletenotes, List<Note> deletednotes)
        {
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    context.Notes.RemoveRange(selectdeletenotes);
                    await context.SaveChangesAsync();

                    foreach (var item in selectdeletenotes)
                    {
                        deletednotes.Remove(item);
                    }

                    deletednotes = deletednotes.OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(deletednotes);
                    await UpdateRangeAsync(deletednotes);

                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    await transaction.RollbackAsync();
                }
            }
        }


        public async Task CastNotes(List<Note> notesForCasting, List<Note> allUserNotes, NoteTypeENUM FromId, NoteTypeENUM ToId)
        {
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    var notesTo = allUserNotes.Where(x => x.NoteTypeId == ToId).ToList();
                    notesTo.ForEach(x => x.Order = x.Order + notesForCasting.Count());
                    await UpdateRangeAsync(notesTo);

                    notesForCasting.ForEach(x =>
                    {
                        x.NoteTypeId = ToId;
                        x.UpdatedAt = DateTimeProvider.Time;
                    });

                    ChangeOrderHelper(notesForCasting);
                    await UpdateRangeAsync(notesForCasting);

                    var oldNotes = allUserNotes.Where(x => x.NoteTypeId == FromId).OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(oldNotes);
                    await UpdateRangeAsync(oldNotes);

                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    await transaction.RollbackAsync();
                }
            }
        }

        private void ChangeOrderHelper(List<Note> notes)
        {
            int order = 1;
            foreach (var item in notes)
            {
                item.Order = order;
                order++;
            }
        }

        public async Task<Note> GetOneById(Guid noteId)
        {
            return await context.Notes.FirstOrDefaultAsync(x => x.Id == noteId);
        }

    }
}
