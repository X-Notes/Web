using Common.DatabaseModels.helpers;
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.models
{
    public class User
    {
        public Guid Id { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }

        public Guid? PhotoId { set; get; }
        public AppFile Photo { set; get; }

        public string PersonalKey { set; get; }

        public Guid LanguageId { set; get; }
        public Language Language { set; get; }

        public NotificationSetting NotificationSettings { set; get; }
        public List<Label> Labels { set; get; }
        public List<Backgrounds> Backgrounds { set; get; }

        public Guid? CurrentBackgroundId { set; get; }
        public Backgrounds CurrentBackground { set; get; }

        public Guid ThemeId { set; get; }
        public Theme Theme { set; get; }

        public Guid FontSizeId { set; get; }
        public FontSize FontSize { set; get; }

        public List<Folder> Folders { set; get; }
        public List<Note> Notes { set; get; }

        public List<UserOnNoteNow> UserOnNotes { set; get; }
        public List<UserOnPrivateNotes> UserOnPrivateNotes { set; get; }
        public List<UsersOnPrivateFolders> UsersOnPrivateFolders { set; get; }
    }
}
