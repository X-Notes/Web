using Common.DatabaseModels.models.NoteContent;
using Common.DatabaseModels.models.Notes;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
                        await UpdateRange(notes);
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


        public async Task<List<Note>> GetNotesByUserIdAndTypeIdWithContent(Guid userId, NoteTypeENUM typeId, bool isHistory)
        {
            return await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as AlbumNote).Photos)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as VideoNote).AppFile)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as AudioNote).AppFile)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as DocumentNote).AppFile)
                .OrderBy(x => x.Order)
                .Where(x => x.UserId == userId && x.NoteTypeId == typeId && x.IsHistory == isHistory).ToListAsync();
        }

        public async Task<List<Note>> GetNotesByIdsWithContent(IEnumerable<Guid> ids)
        {
            return await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as AlbumNote).Photos)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as VideoNote).AppFile)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as AudioNote).AppFile)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as DocumentNote).AppFile)
                .OrderBy(x => x.Order)
                .Where(x => ids.Contains(x.Id) && x.IsHistory == false).ToListAsync();
        }



        public async Task<List<Note>> GetNotesByUserIdAndTypeIdNoContent(Guid userId, NoteTypeENUM typeId)
        {
            return await context.Notes
                .OrderBy(x => x.Order)
                .Where(x => x.UserId == userId && x.NoteTypeId == typeId).ToListAsync();
        }

        public async Task<Note> GetNoteByUserIdAndTypeIdForCopy(Guid noteId)
        {
            return await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as AlbumNote).Photos)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as VideoNote).AppFile)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as AudioNote).AppFile)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as DocumentNote).AppFile)
                .FirstOrDefaultAsync(x => x.Id == noteId);
        }


        public async Task<List<Note>> GetNotesByUserId(Guid userId)
        {
            return await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as AlbumNote).Photos)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as VideoNote).AppFile)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as AudioNote).AppFile)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as DocumentNote).AppFile)
                .Where(x => x.UserId == userId && x.IsHistory == false)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Note>> GetNotesByUserIdWithoutNote(Guid userId, Guid noteId)
        {
            return await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as AlbumNote).Photos)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as VideoNote).AppFile)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as AudioNote).AppFile)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as DocumentNote).AppFile)
                .Where(x => x.UserId == userId && x.Id != noteId && x.IsHistory == false)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
        }


        public async Task<List<Note>> GetNotesWithLabelsByUserId(Guid userId)
        {
            return await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(x => x.Label)
                .Where(x => x.UserId == userId).ToListAsync();
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
                    await UpdateRange(deletednotes);

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
                    await UpdateRange(notesTo);

                    notesForCasting.ForEach(x =>
                    {
                        x.NoteTypeId = ToId;
                        x.UpdatedAt = DateTimeOffset.Now;
                    });

                    ChangeOrderHelper(notesForCasting);
                    await UpdateRange(notesForCasting);

                    var oldNotes = allUserNotes.Where(x => x.NoteTypeId == FromId).OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(oldNotes);
                    await UpdateRange(oldNotes);

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
