using Common.DatabaseModels.helpers;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DatabaseModels.models
{
    public class PersonalitionSetting
    {
        public int Id { set; get; }
        public Theme Theme { set; get; }
        public FontSize FontSize { set; get; }
        public int UserId { set; get; }
        public User User { set; get; }
    }
}
