using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System;
using Common.DatabaseModels.models.Notes;
using Common.DatabaseModels.models.Users;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Notes
{
    public class UserOnNoteRepository : Repository<UserOnNoteNow>
    {
        public UserOnNoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }

        public async Task<List<User>> GetUsersOnlineUserOnNote(Guid noteId)
        {
            return await context.UserOnNoteNow
                .Include(x => x.User)
                .ThenInclude(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .Where(x => x.NoteId == noteId)
                .Select(x => x.User).ToListAsync();
        }
    }
}
