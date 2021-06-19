using Common.DatabaseModels.models.Users;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Users
{
    public class UserProfilePhotoRepository : Repository<UserProfilePhoto>
    {
        public UserProfilePhotoRepository(WriteContextDB contextDB)
                : base(contextDB)
        {
        }

        public async Task<UserProfilePhoto> GetWithFile(Guid userId)
        {
            return await this.entities.Include(x => x.AppFile).FirstOrDefaultAsync(x => x.UserId == userId);
        }
    }
}
