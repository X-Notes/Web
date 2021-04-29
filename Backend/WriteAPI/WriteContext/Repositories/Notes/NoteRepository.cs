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
    public class NoteRepository : Repository<Note>
    {
        public NoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }

        public async Task Add(Note note, Guid TypeId)
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
                    await transaction.RollbackAsync();
                }
            }
        }


        public async Task<Note> GetForCheckPermission(Guid id)
        {
            return await context.Notes
                .Include(x => x.NoteType)
                .Include(x => x.RefType)
                .Include(x => x.User)
                .Include(x => x.UsersOnPrivateNotes)
                .ThenInclude(x => x.AccessType)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Note> GetFull(Guid id)
        {
            return await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.NoteType)
                .Include(x => x.RefType)
                .FirstOrDefaultAsync(x => x.Id == id);
        }


        public async Task<List<Note>> GetNotesByUserIdAndTypeId(Guid userId, Guid typeId)
        {
            return await context.Notes
                .Include(x => x.RefType)
                .Include(x => x.NoteType)
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents).ThenInclude(z => (z as AlbumNote).Photos)
                .OrderBy(x => x.Order)
                .Where(x => x.UserId == userId && x.NoteTypeId == typeId).ToListAsync();
        }

        public async Task<List<Note>> GetNotesByUserIdAndTypeIdNoContent(Guid userId, Guid typeId)
        {
            return await context.Notes
                .OrderBy(x => x.Order)
                .Where(x => x.UserId == userId && x.NoteTypeId == typeId).ToListAsync();
        }


        public async Task<Note> GetNoteByUserIdAndTypeIdForCopy(Guid noteId)
        {
            return await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents).ThenInclude(z => (z as AlbumNote).Photos)
                .FirstOrDefaultAsync(x => x.Id == noteId);
        }


        public async Task<List<Note>> GetNotesByUserId(Guid userId)
        {
            return await context.Notes
                .Include(x => x.RefType)
                .Include(x => x.NoteType)
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents).ThenInclude(z => (z as AlbumNote).Photos)
                .Where(x => x.UserId == userId)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Note>> GetNotesByUserIdWithoutNote(Guid userId, Guid noteId)
        {
            return await context.Notes
                .Include(x => x.RefType)
                .Include(x => x.NoteType)
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents).ThenInclude(z => (z as AlbumNote).Photos)
                .Where(x => x.UserId == userId && x.Id != noteId)
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
                    await transaction.RollbackAsync();
                }
            }
        }


        public async Task CastNotes(List<Note> notesForCasting, List<Note> allUserNotes, Guid FromId, Guid ToId)
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
            return await context.Notes.Include(x => x.RefType).FirstOrDefaultAsync(x => x.Id == noteId);
        }

    }
}
