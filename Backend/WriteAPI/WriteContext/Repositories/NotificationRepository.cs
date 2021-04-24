using Common.DatabaseModels.models;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class NotificationRepository : Repository<Notification>
    {
        public NotificationRepository(WriteContextDB contextDB)
            : base(contextDB)
        {

        }
    }
}
