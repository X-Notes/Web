using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.helpers;
using WriteContext.models;

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

        private async Task UpdateRangeNotes(List<Note> notes)
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
                .Where(x => x.UserId == userId && x.IsArchive == false && x.IsDeleted == false && x.AccessStatus == NoteStatus.Private).ToListAsync();
        }

        public async Task<List<Note>> GetSharedNotesByUserId(int userId)
        {
            return await contextDB.Notes
                .Where(x => x.UserId == userId && x.IsArchive == false && x.IsDeleted == false && x.AccessStatus == NoteStatus.Public).ToListAsync();
        }

        public async Task<List<Note>> GetArchiveNotesByUserId(int userId)
        {
            return await contextDB.Notes
                .Where(x => x.UserId == userId && x.IsArchive == true && x.IsDeleted == false && x.AccessStatus == NoteStatus.Private).ToListAsync();
        }

        public async Task<List<Note>> GetDeletedNotesByUserId(int userId)
        {
            return await contextDB.Notes
                .Where(x => x.UserId == userId && x.IsArchive == false && x.IsDeleted == true && x.AccessStatus == NoteStatus.Private).ToListAsync();
        }
    }
}
