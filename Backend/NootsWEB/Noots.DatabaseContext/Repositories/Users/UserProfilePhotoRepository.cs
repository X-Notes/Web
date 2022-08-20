using Common.DatabaseModels.Models.Users;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Users
{
    public class UserProfilePhotoRepository : Repository<UserProfilePhoto, Guid>
    {
        public UserProfilePhotoRepository(NootsDBContext contextDB)
                : base(contextDB)
        {
        }

        public Task<UserProfilePhoto> GetWithFile(Guid userId)
        {
            return this.entities.Include(x => x.AppFile).FirstOrDefaultAsync(x => x.UserId == userId);
        }
    }
}
