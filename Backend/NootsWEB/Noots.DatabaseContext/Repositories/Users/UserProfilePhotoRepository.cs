using Common.DatabaseModels.Models.Users;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.Users
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
