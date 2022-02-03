using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Common.DatabaseModels.Models.Notes;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Notes
{
    public class UsersOnPrivateNotesRepository : Repository<UserOnPrivateNotes, Guid>
    {
        public UsersOnPrivateNotesRepository(WriteContextDB contextDB)
            :base(contextDB)
        {
        }

        public async Task<List<UserOnPrivateNotes>> GetByNoteIdUserOnPrivateNote(Guid noteId)
        {
            return await entities
                .Include(x => x.User)
                .ThenInclude(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .Where(x => x.NoteId == noteId).ToListAsync();
        }

        public async Task<List<UserOnPrivateNotes>> GetByNoteIdsWithUser(List<Guid> noteIds)
        {
            return await entities.Where(x => noteIds.Contains(x.NoteId)).ToListAsync();
        }

    }
}
