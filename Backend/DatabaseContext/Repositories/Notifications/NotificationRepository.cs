using Common.DatabaseModels.Models.Users.Notifications;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.Notifications
{
    public class NotificationRepository : Repository<Notification, Guid>
    {
        public NotificationRepository(ApiDbContext contextDb)
            : base(contextDb)
        {

        }

        public Task<List<Notification>> GetByUserOrdered(Guid userId)
        {
            return entities
                .Include(x => x.UserFrom)
                    .ThenInclude(x => x.UserProfilePhoto)
                    .ThenInclude(x => x.AppFile)
                .Where(x => x.UserToId == userId)
                .OrderByDescending(x => x.Date).AsSplitQuery().ToListAsync();
        }

        public Task<Notification> GetByIdIncludeUser(Guid id)
        {
            return entities
                .Include(x => x.UserFrom)
                    .ThenInclude(x => x.UserProfilePhoto)
                    .ThenInclude(x => x.AppFile)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task<List<Notification>> GetByIdsIncludeUser(params Guid[] ids)
        {
            return entities
                .Include(x => x.UserFrom)
                    .ThenInclude(x => x.UserProfilePhoto)
                    .ThenInclude(x => x.AppFile)
                .Where(x => ids.Contains(x.Id))
                .AsSplitQuery().ToListAsync();
        }
    }
}