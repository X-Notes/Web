using System;

namespace Common.DatabaseModels.Models.Users
{
    public class NotificationSetting : BaseEntity<Guid>
    {
        public Guid UserId { set; get; }
        public User User { set; get; }
    }
}
