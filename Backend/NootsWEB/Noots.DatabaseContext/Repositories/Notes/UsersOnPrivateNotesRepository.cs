using Common.DatabaseModels.Models.Notes;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Notes
{
    public class UsersOnPrivateNotesRepository : Repository<UserOnPrivateNotes, Guid>
    {
        public UsersOnPrivateNotesRepository(NootsDBContext contextDB)
            :base(contextDB)
        {
        }

        public Task<List<UserOnPrivateNotes>> GetByNoteIdUserOnPrivateNote(Guid noteId)
        {
            return entities
                .Include(x => x.User)
                .ThenInclude(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .Where(x => x.NoteId == noteId).ToListAsync();
        }

        public Task<List<Guid>> GetNoteIdsByUserId(Guid userId)
        {
            return entities.Where(x => x.UserId == userId).Select(x => x.NoteId).ToListAsync();
        }
    }
}
