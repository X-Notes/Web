using System;
using System.Collections.Generic;
using System.Text;
using WriteContext.helpers;

namespace WriteContext.models
{
    public class PersonalitionSetting
    {
        public int Id { set; get; }
        public Theme Theme { set; get; }
        public int FontSize { set; get; }
        public int UserId { set; get; }
        public User User { set; get; }
    }
}
