using Common.DatabaseModels.Models.Notes;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.Notes
{
    public class UsersOnPrivateNotesRepository : Repository<UserOnPrivateNotes, Guid>
    {
        public UsersOnPrivateNotesRepository(ApiDbContext contextDB)
            :base(contextDB)
        {
        }
        
        public async Task<UserOnPrivateNotes?> GetUserAsync(Guid noteId, Guid userId)
        {
            return await entities.FirstOrDefaultAsync(x => x.NoteId == noteId && x.UserId == userId);
        }

        public Task<List<UserOnPrivateNotes>> GetByNoteIdUserOnPrivateNote(Guid noteId)
        {
            return entities
                .Include(x => x.User)
                .ThenInclude(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .Where(x => x.NoteId == noteId).ToListAsync();
        }
        
        public async Task<List<Guid>> GetNoteUserIdsAsync(Guid noteId)
        {
            return await entities
                .Where(x => x.NoteId == noteId)
                .Select(x => x.UserId)
                .ToListAsync();
        }

        public Task<List<Guid>> GetNoteIdsByUserId(Guid userId)
        {
            return entities.Where(x => x.UserId == userId).Select(x => x.NoteId).ToListAsync();
        }
    }
}
