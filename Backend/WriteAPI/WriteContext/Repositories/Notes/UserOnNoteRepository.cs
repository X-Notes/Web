using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System;
using Common.DatabaseModels.models.Notes;
using Common.DatabaseModels.models.Users;

namespace WriteContext.Repositories.Notes
{
    public class UserOnNoteRepository
    {
        private readonly WriteContextDB contextDB;
        public UserOnNoteRepository(WriteContextDB contextDB)
        {
            this.contextDB = contextDB;
        }

        public async Task Add(UserOnNoteNow userOnNote)
        {
            await contextDB.AddAsync(userOnNote);
            await contextDB.SaveChangesAsync();
        }

        public async Task RemoveFromOnline(Guid userId)
        {
            var users = await contextDB.UserOnNoteNow.Where(x => x.UserId == userId).ToListAsync();
            if(users.Any())
            {
                contextDB.UserOnNoteNow.RemoveRange(users);
                await contextDB.SaveChangesAsync();
            }
        }

        public async Task<List<User>> GetUsersOnlineUserOnNote(Guid noteId)
        {
            return await contextDB.UserOnNoteNow.Include(x => x.User).Where(x => x.NoteId == noteId).Select(x => x.User).ToListAsync();
        }

        public async Task<UserOnNoteNow> GetUserFromNoteByIds(Guid userId, Guid noteId)
        {
            return await contextDB.UserOnNoteNow.Where(x => x.UserId == userId && x.NoteId == noteId).FirstOrDefaultAsync();
        }
    }
}
