using Common.DatabaseModels.helpers;
using Common.DatabaseModels.models;
using Common.DTO.notes;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WriteContext.Repositories
{
    public class NoteRepository
    {
        private readonly WriteContextDB contextDB;
        public NoteRepository(WriteContextDB contextDB)
        {
            this.contextDB = contextDB;
        }

        public async Task Add(Note note)
        {
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    var notes = await GetPrivateNotesByUserId(note.UserId);

                    if (notes.Count() > 0)
                    {
                        notes.ForEach(x => x.Order = x.Order + 1);
                        await UpdateRangeNotes(notes);
                    }

                    await contextDB.Notes.AddAsync(note);
                    await contextDB.SaveChangesAsync();

                    await transaction.CommitAsync();

                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                }
            }
        }


        public async Task AddRange(List<Note> list)
        {
            contextDB.Notes.AddRange(list);
            await contextDB.SaveChangesAsync();
        }

        public async Task UpdateNote(Note note)
        {
            this.contextDB.Notes.Update(note);
            await contextDB.SaveChangesAsync();
        }

        public async Task UpdateRangeNotes(List<Note> notes)
        {
            this.contextDB.Notes.UpdateRange(notes);
            await contextDB.SaveChangesAsync();
        }

        public async Task<Note> GetFull(Guid id)
        {
            return await contextDB.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Note>> GetPrivateNotesByUserId(int userId)
        {
            return await contextDB.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Where(x => x.UserId == userId && x.NoteType == NotesType.Private).ToListAsync();
        }

        public async Task<List<Note>> GetSharedNotesByUserId(int userId)
        {
            return await contextDB.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Where(x => x.UserId == userId && x.NoteType == NotesType.Shared).ToListAsync();
        }

        public async Task<List<Note>> GetArchiveNotesByUserId(int userId)
        {
            return await contextDB.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Where(x => x.UserId == userId && x.NoteType == NotesType.Archive).ToListAsync();
        }

        public async Task<List<Note>> GetDeletedNotesByUserId(int userId)
        {
            return await contextDB.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Where(x => x.UserId == userId && x.NoteType == NotesType.Deleted).ToListAsync();
        }

        public async Task<List<Note>> GetNotesWithLabelsByUserId(int userId)
        {
            return await contextDB.Notes.Include(x => x.LabelsNotes).ThenInclude(x => x.Label).Where(x => x.UserId == userId).ToListAsync();
        }

        // UPPER MENU FUNCTIONS

        public async Task DeleteRangeDeleted(List<Note> selectdeletenotes, List<Note> deletednotes)
        {
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    this.contextDB.Notes.RemoveRange(selectdeletenotes);
                    await contextDB.SaveChangesAsync();

                    foreach (var item in selectdeletenotes)
                    {
                        deletednotes.Remove(item);
                    }

                    deletednotes = deletednotes.OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(deletednotes);
                    await UpdateRangeNotes(deletednotes);

                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                }
            }
        }


        public async Task CastNotes(List<Note> notesForCasting, List<Note> allUserNotes, NotesType noteTypeFrom, NotesType noteTypeTo)
        {
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    var notesTo = allUserNotes.Where(x => x.NoteType == noteTypeTo).ToList();
                    notesTo.ForEach(x => x.Order = x.Order + notesForCasting.Count());
                    await UpdateRangeNotes(notesTo);

                    notesForCasting.ForEach(x => x.NoteType = noteTypeTo);
                    ChangeOrderHelper(notesForCasting);
                    await UpdateRangeNotes(notesForCasting);

                    var oldNotes = allUserNotes.Where(x => x.NoteType == noteTypeFrom).OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(oldNotes);
                    await UpdateRangeNotes(oldNotes);

                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                }
            }
        }

        public async Task<List<Note>> CopyNotes(List<Note> notesForCopy, List<Note> allUserNotes, NotesType noteTypeFrom, NotesType noteTypeTo)
        {
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    var notesTo = allUserNotes.Where(x => x.NoteType == noteTypeTo).ToList();
                    notesTo.ForEach(x => x.Order = x.Order + notesForCopy.Count());
                    await UpdateRangeNotes(notesTo);

                    var newNotes = notesForCopy.Select(x => new Note() { 
                        Color = x.Color,
                        CreatedAt = DateTimeOffset.Now,
                        NoteType = noteTypeTo,
                        Title = x.Title,
                        UserId = x.UserId,
                        LabelsNotes = x.LabelsNotes,
                    }).ToList();
                    ChangeOrderHelper(newNotes);
                    await AddRange(newNotes);

                    var oldNotes = allUserNotes.Where(x => x.NoteType == noteTypeFrom).OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(oldNotes);
                    await UpdateRangeNotes(oldNotes);

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
    }
}
