using Common.DatabaseModels.helpers;
using Common.DatabaseModels.models;
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
            using (var transaction = contextDB.Database.BeginTransaction())
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

                    transaction.Commit();

                }
                catch (Exception e)
                {
                    transaction.Rollback();
                }
            }
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
            return await contextDB.Notes.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Note>> GetPrivateNotesByUserId(int userId)
        {
            return await contextDB.Notes
                .Where(x => x.UserId == userId && x.NoteType == NotesType.Private).ToListAsync();
        }

        public async Task<List<Note>> GetSharedNotesByUserId(int userId)
        {
            return await contextDB.Notes
                .Where(x => x.UserId == userId && x.NoteType == NotesType.Shared).ToListAsync();
        }

        public async Task<List<Note>> GetArchiveNotesByUserId(int userId)
        {
            return await contextDB.Notes
                .Where(x => x.UserId == userId && x.NoteType == NotesType.Archive).ToListAsync();
        }

        public async Task<List<Note>> GetDeletedNotesByUserId(int userId)
        {
            return await contextDB.Notes
                .Where(x => x.UserId == userId && x.NoteType == NotesType.Deleted).ToListAsync();
        }

        // UPPER MENU FUNCTIONS

        public async Task SetDeletedNotes(List<Note> noteForDeleting, List<Note> allUserNotes, NotesType noteType)
        {
            using (var transaction = contextDB.Database.BeginTransaction())
            {
                try
                {
                    switch (noteType)
                    {
                        case NotesType.Private:
                            {
                                // Update table with deleted 
                                var deletedNotes = allUserNotes.Where(x => x.NoteType == NotesType.Deleted).ToList();
                                deletedNotes.ForEach(x => x.Order = x.Order + noteForDeleting.Count());
                                await UpdateRangeNotes(deletedNotes);

                                // Deleting notes
                                noteForDeleting.ForEach(x => x.NoteType = NotesType.Deleted);
                                ChangeOrderHelper(noteForDeleting);
                                await UpdateRangeNotes(noteForDeleting);

                                // Update private
                                var privateNotes = allUserNotes.Where(x => x.NoteType == NotesType.Private).OrderBy(x => x.Order).ToList();
                                ChangeOrderHelper(privateNotes);
                                await UpdateRangeNotes(privateNotes);

                                break;
                            }
                    }
                    transaction.Commit();
                }
                catch (Exception e)
                {

                    transaction.Rollback();
                }
            }
        }

        public async Task RestoreRange(List<Note> notesForRestore, List<Note> allNotes)
        {
            using (var transaction = contextDB.Database.BeginTransaction())
            {
                try
                {
                    notesForRestore.ForEach(x => x.NoteType = NotesType.Private);
                    await UpdateRangeNotes(notesForRestore);

                    transaction.Commit();
                }
                catch (Exception e)
                {
                    transaction.Rollback();
                }
            }
        }

        public async Task DeleteRangeDeleted(List<Note> selectdeletenotes, List<Note> deletednotes)
        {
            using (var transaction = contextDB.Database.BeginTransaction())
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

                    transaction.Commit();
                }
                catch (Exception e)
                {
                    transaction.Rollback();
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
