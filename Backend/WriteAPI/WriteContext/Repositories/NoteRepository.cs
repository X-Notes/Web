using Common.DatabaseModels.models;
using Common.DatabaseModels.models.NoteContent;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class NoteRepository : Repository<Note>
    {
        public NoteRepository(WriteContextDB contextDB)
            :base(contextDB)
        {
        }

        public async Task Add(Note note, Guid TypeId)
        {
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    var notes = await GetNotesByUserIdAndTypeId(note.UserId , TypeId);

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
                .OrderBy(x => x.Order)
                .Where(x => x.UserId == userId && x.NoteTypeId == typeId).ToListAsync();
        }
        public async Task<List<Note>> GetNotesByUserId(Guid userId)
        {
            return await context.Notes
                .Include(x => x.RefType)
                .Include(x => x.NoteType)
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Where(x => x.UserId == userId)
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
                    this.context.Notes.RemoveRange(selectdeletenotes);
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

                    notesForCasting.ForEach(x => x.NoteTypeId = ToId);
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

        public async Task<List<Note>> CopyNotes(List<Note> notesForCopy, List<Note> allUserNotes, Guid FromId, Guid ToId)
        {
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    var notesTo = allUserNotes.Where(x => x.NoteTypeId == ToId).ToList();
                    notesTo.ForEach(x => x.Order = x.Order + notesForCopy.Count());
                    await UpdateRange(notesTo);

                    var newNotes = notesForCopy.Select(x => new Note() { 
                        Color = x.Color,
                        CreatedAt = DateTimeOffset.Now,
                        NoteTypeId = ToId,
                        Title = x.Title,
                        UserId = x.UserId,
                        LabelsNotes = x.LabelsNotes,
                        RefTypeId = x.RefTypeId,
                    }).ToList();
                    ChangeOrderHelper(newNotes);
                    await AddRange(newNotes);

                    var oldNotes = allUserNotes.Where(x => x.NoteTypeId == FromId).OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(oldNotes);
                    await UpdateRange(oldNotes);

                    await transaction.CommitAsync();

                    return newNotes.OrderBy(x => x.Order).ToList();
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    throw new Exception();
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
