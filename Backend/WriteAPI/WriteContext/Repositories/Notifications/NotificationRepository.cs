using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Users;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Notifications
{
    public class NotificationRepository : Repository<Notification, Guid>
    {
        public NotificationRepository(WriteContextDB contextDB)
            : base(contextDB)
        {

        }

        public async Task<List<Notification>> GetByUserOrdered(Guid userId)
        {
            return await entities
                .Include(x => x.UserFrom)
                .ThenInclude(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .Where(x => x.UserToId == userId)
                .OrderByDescending(x => x.Date).ToListAsync();
        }
    }
}
