using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DatabaseModels.models
{
    public class NotificationSetting
    {
        public int Id { set; get; }
        public int UserId { set; get; }
        public User User { set; get; }
    }
}
