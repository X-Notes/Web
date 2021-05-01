using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Common.DatabaseModels.models.Notes;

namespace WriteContext.Repositories.Notes
{
    public class UsersOnPrivateNotesRepository
    {
        private readonly WriteContextDB contextDB;
        public UsersOnPrivateNotesRepository(WriteContextDB contextDB)
        {
            this.contextDB = contextDB;
        }


        public async Task Add(UserOnPrivateNotes userOnNote)
        {
            await contextDB.UserOnPrivateNotes.AddAsync(userOnNote);
            await contextDB.SaveChangesAsync();
        }
        public async Task AddRange(List<UserOnPrivateNotes> permissions)
        {
            await contextDB.UserOnPrivateNotes.AddRangeAsync(permissions);
            await contextDB.SaveChangesAsync();
        }

        public async Task<UserOnPrivateNotes> GetByUserIdAndNoteId(Guid userId, Guid noteId)
        {
            return await contextDB.UserOnPrivateNotes.FirstOrDefaultAsync(x => x.NoteId == noteId && x.UserId == userId);
        }

        public async Task<List<UserOnPrivateNotes>> GetByNoteIdUserOnPrivateNote(Guid noteId)
        {
            return await contextDB.UserOnPrivateNotes
                .Include(x => x.User)
                .Include(x => x.AccessType)
                .Where(x => x.NoteId == noteId).ToListAsync();
        }

        public async Task Update(UserOnPrivateNotes userOnNote)
        {
            contextDB.UserOnPrivateNotes.Update(userOnNote);
            await contextDB.SaveChangesAsync();
        }

        public async Task Remove(UserOnPrivateNotes userOnNote)
        {
            contextDB.UserOnPrivateNotes.Remove(userOnNote);
            await contextDB.SaveChangesAsync();
        }
    }
}
