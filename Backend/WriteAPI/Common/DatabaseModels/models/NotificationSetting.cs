using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DatabaseModels.models
{
    public class NotificationSetting
    {
        public Guid Id { set; get; }
        public Guid UserId { set; get; }
        public User User { set; get; }
    }
}
