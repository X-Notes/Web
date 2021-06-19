using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DatabaseModels.models.Users
{
    public class NotificationSetting : BaseEntity<Guid>
    {
        public Guid UserId { set; get; }
        public User User { set; get; }
    }
}
