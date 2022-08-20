using Common.DatabaseModels.Models.Users;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Notifications
{
    public class NotificationRepository : Repository<Notification, Guid>
    {
        public NotificationRepository(NootsDBContext contextDB)
            : base(contextDB)
        {

        }

        public Task<List<Notification>> GetByUserOrdered(Guid userId)
        {
            return entities
                .Include(x => x.UserFrom)
                .ThenInclude(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .Where(x => x.UserToId == userId)
                .OrderByDescending(x => x.Date).ToListAsync();
        }
    }
}
