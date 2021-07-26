using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.Notes;
using Common.DTO.Personalization;
using WriteContext.GenericRepositories;

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


        public async Task<Note> GetForCheckPermission(Guid id)
        {
            return await context.Notes
                .Include(x => x.User)
                .Include(x => x.UsersOnPrivateNotes)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Note> GetFull(Guid id)
        {
            return await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .FirstOrDefaultAsync(x => x.Id == id);
        }


        public List<int> GetFilterTypes(PersonalizationSettingDTO settings)
        {
            var types = new List<int>();
            types.Add((int)ContentTypeENUM.Text);
            if (settings.IsViewPhotosOnNote)
            {
                types.Add((int)ContentTypeENUM.Album);
            }

            if (settings.IsViewVideoOnNote)
            {
                types.Add((int)ContentTypeENUM.Video);
            }

            if (settings.IsViewAudioOnNote)
            {
                types.Add((int)ContentTypeENUM.PlaylistAudios);
            }

            if (settings.IsViewDocumentOnNote)
            {
                types.Add((int)ContentTypeENUM.Document);
            }
            return types;
        }


        public async Task<List<Note>> GetWithFilteredContent(List<Note> notes, PersonalizationSettingDTO settings)
        {
            var types = GetFilterTypes(settings);

            var notesIds = notes.Select(z => z.Id).ToHashSet();

            var contents = await context.BaseNoteContents
                .Where(z => types.Contains((int)z.ContentTypeId) && notesIds.Contains(z.NoteId.Value))
                .Include(z => (z as AlbumNote).Photos)
                .Include(x => (x as VideoNote).AppFile)
                .Include(x => (x as AudiosPlaylistNote).Audios)
                .Include(x => (x as DocumentNote).AppFile).ToListAsync();

            var contentLookUp = contents.ToLookup(x => x.NoteId);
            notes.ForEach(note => note.Contents = contentLookUp[note.Id].Take(settings.ContentInNoteCount).OrderBy(z => z.Order).ToList());

            return notes;
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


        public async Task<Note> GetNoteByIdForCopy(Guid noteId)
        {
            return await entities
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as AlbumNote).AlbumNoteAppFiles)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as AlbumNote).Photos)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as AudiosPlaylistNote).AudioNoteAppFiles)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as AudiosPlaylistNote).Audios)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as VideoNote).AppFile)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as DocumentNote).AppFile)
                .FirstOrDefaultAsync(x => x.Id == noteId);
        }


        public async Task<List<Note>> GetNotesByUserIdWithoutNote(Guid userId, Guid noteId, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Where(x => x.UserId == userId && x.Id != noteId)
                .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
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
                        x.UpdatedAt = DateTimeOffset.Now;
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
