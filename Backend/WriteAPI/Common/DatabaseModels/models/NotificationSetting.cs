using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DatabaseModels.models
{
    public class NotificationSetting : BaseEntity
    {
        public Guid UserId { set; get; }
        public User User { set; get; }
    }
}
