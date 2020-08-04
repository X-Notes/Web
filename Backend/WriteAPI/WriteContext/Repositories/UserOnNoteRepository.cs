using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System;
using Common.DatabaseModels.models;

namespace WriteContext.Repositories
{
    public class UserOnNoteRepository
    {
        private readonly WriteContextDB contextDB;
        public UserOnNoteRepository(WriteContextDB contextDB)
        {
            this.contextDB = contextDB;
        }

        public async Task Add(UserOnNote userOnNote)
        {
            await contextDB.AddAsync(userOnNote);
            await contextDB.SaveChangesAsync();
        }

        public async Task RemoveFromOnline(int userId)
        {
            var connectionsds = await contextDB.UserOnNote.Where(x => x.UserId == userId).ToListAsync();
            contextDB.UserOnNote.RemoveRange(connectionsds);
            await contextDB.SaveChangesAsync();
        }

        public async Task<List<User>> GetUsersOnlineUserOnNote(Guid noteId)
        {
            return await contextDB.UserOnNote.Include(x => x.User).Where(x => x.NoteId == noteId).Select(x => x.User).ToListAsync();
        }

        public async Task<UserOnNote> GetUserFromNoteByIds(int userId, Guid noteId)
        {
            return await contextDB.UserOnNote.Where(x => x.UserId == userId && x.NoteId == noteId).FirstOrDefaultAsync();
        }
    }
}
