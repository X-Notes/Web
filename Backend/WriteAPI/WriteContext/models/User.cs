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
        public List<Backgrounds> Backgrounds { set; get; }

        public int? CurrentBackgroundId { set; get; }
        public Backgrounds CurrentBackground { set; get; }

        // public ICollection<RelantionShip> FriendRequestsMade { get; set; }

        // public ICollection<RelantionShip> FriendRequestsAccepted { get; set; }

        public List<Folder> Folders { set; get; }
        public List<Note> Notes { set; get; }

        public List<UserOnNote> UserOnNotes { set; get; }
    }
}
