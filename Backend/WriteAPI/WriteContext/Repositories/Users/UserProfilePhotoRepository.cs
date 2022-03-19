using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Users;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Users
{
    public class UserProfilePhotoRepository : Repository<UserProfilePhoto, Guid>
    {
        public UserProfilePhotoRepository(WriteContextDB contextDB)
                : base(contextDB)
        {
        }

        public Task<UserProfilePhoto> GetWithFile(Guid userId)
        {
            return this.entities.Include(x => x.AppFile).FirstOrDefaultAsync(x => x.UserId == userId);
        }
    }
}
