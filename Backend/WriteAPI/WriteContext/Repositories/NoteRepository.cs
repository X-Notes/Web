using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
                    var notes = await GetByUserId(note.UserId);

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

        public async Task<Note> GetFull(int id)
        {
            return await contextDB.Notes.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Note>> GetByUserId(int userId)
        {
            return await contextDB.Notes.Where(x => x.UserId == userId).ToListAsync();
        }
    }
}
