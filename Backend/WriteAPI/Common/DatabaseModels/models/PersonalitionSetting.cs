using Common.DatabaseModels.helpers;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DatabaseModels.models
{
    public class PersonalitionSetting
    {
        public Guid Id { set; get; }
        public Theme Theme { set; get; }
        public FontSize FontSize { set; get; }
        public Guid UserId { set; get; }
        public User User { set; get; }
    }
}
