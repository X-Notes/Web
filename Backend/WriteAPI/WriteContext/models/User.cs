using System.Collections.Generic;
using WriteContext.helpers;

namespace WriteContext.models
{
    public class User
    {
        public int Id { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }
        public string PhotoId { set; get; }
        public string PersonalKey { set; get; }
        public Language Language { set; get; }
        public NotificationSetting NotificationSettings { set; get; }
        public PersonalitionSetting PersonalitionSettings { set; get; }
        public List<Label> Labels { set; get; }
        public List<RelantionShip> RelantionShips { set; get; }
    }
}
