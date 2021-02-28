using Common.DatabaseModels.models;
using Common.DatabaseModels.models.NoteContent;
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

        public async Task Add(Note note, Guid TypeId)
        {
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    var notes = await GetNotesByUserIdAndTypeId(note.UserId , TypeId);

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

        public async Task<Note> GetForUpdating(Guid id)
        {
            return await contextDB.Notes
                .Include(x => x.NoteType)
                .Include(x => x.RefType)
                .Include(x => x.UsersOnPrivateNotes)
                .ThenInclude(x => x.AccessType)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Note> GetFull(Guid id)
        {
            return await contextDB.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.UsersOnPrivateNotes)
                .Include(x => x.NoteType)
                .Include(x => x.RefType)
                .Include(x => x.Contents)
                .ThenInclude(x => (x as AlbumNote).Photos)
                .AsSplitQuery()
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Note>> GetNotesByUserIdAndTypeId(Guid userId, Guid typeId)
        {
            return await contextDB.Notes
                .Include(x => x.RefType)
                .Include(x => x.NoteType)
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Where(x => x.UserId == userId && x.NoteTypeId == typeId).ToListAsync();
        }


        public async Task<List<Note>> GetNotesWithLabelsByUserId(Guid userId)
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


        public async Task CastNotes(List<Note> notesForCasting, List<Note> allUserNotes, Guid FromId, Guid ToId)
        {
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    var notesTo = allUserNotes.Where(x => x.NoteTypeId == ToId).ToList();
                    notesTo.ForEach(x => x.Order = x.Order + notesForCasting.Count());
                    await UpdateRangeNotes(notesTo);

                    notesForCasting.ForEach(x => x.NoteTypeId = ToId);
                    ChangeOrderHelper(notesForCasting);
                    await UpdateRangeNotes(notesForCasting);

                    var oldNotes = allUserNotes.Where(x => x.NoteTypeId == FromId).OrderBy(x => x.Order).ToList();
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

        public async Task<List<Note>> CopyNotes(List<Note> notesForCopy, List<Note> allUserNotes, Guid FromId, Guid ToId)
        {
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    var notesTo = allUserNotes.Where(x => x.NoteTypeId == ToId).ToList();
                    notesTo.ForEach(x => x.Order = x.Order + notesForCopy.Count());
                    await UpdateRangeNotes(notesTo);

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

        public async Task<Note> GetOneById(Guid noteId)
        {
            return await contextDB.Notes.Include(x => x.RefType).FirstOrDefaultAsync(x => x.Id == noteId);
        }

        public async Task<bool> AddAlbum(List<AppFile> files, Note note)
        {
            var success = true;
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    await contextDB.Files.AddRangeAsync(files);
                    await contextDB.SaveChangesAsync();

                    var albumNote = new AlbumNote() { Photos = files, Note = note };

                    await contextDB.AlbumNotes.AddAsync(albumNote);
                    await contextDB.SaveChangesAsync();

                    await transaction.CommitAsync();

                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    success = false;
                }
            }
            return success;
        }
    }
}
