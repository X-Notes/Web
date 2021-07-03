﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Plan;
using Common.DatabaseModels.Models.Systems;

namespace Common.DatabaseModels.Models.Users
{
    public class User : BaseEntity<Guid>
    {
        public string Name { set; get; }

        [Required]
        public string Email { set; get; }

        public UserProfilePhoto UserProfilePhoto { set; get; }

        public List<AppFile> Files { set; get; }

        public string PersonalKey { set; get; }

        public LanguageENUM LanguageId { set; get; }
        public Language Language { set; get; }

        public NotificationSetting NotificationSettings { set; get; }

        public PersonalizationSetting PersonalizationSetting { set; get; }

        public List<Label> Labels { set; get; }

        public List<Backgrounds> Backgrounds { set; get; }

        public Guid? CurrentBackgroundId { set; get; }
        public Backgrounds CurrentBackground { set; get; }

        public ThemeENUM ThemeId { set; get; }
        public Theme Theme { set; get; }

        public FontSizeENUM FontSizeId { set; get; }
        public FontSize FontSize { set; get; }

        public List<Folder> Folders { set; get; }
        public List<Note> Notes { set; get; }

        public List<UserOnNoteNow> UserOnNotes { set; get; }

        public List<UserOnPrivateNotes> UserOnPrivateNotes { set; get; }

        public List<UsersOnPrivateFolders> UsersOnPrivateFolders { set; get; }

        public List<Notification> NotificationsFrom { set; get; }
        public List<Notification> NotificationsTo { set; get; }

        public List<NoteHistory> NoteHistories { set; get; }

        public List<UserNoteHistoryManyToMany> UserHistories { set; get; }

        public BillingPlanTypeENUM BillingPlanId { set; get; }
        public BillingPlan BillingPlan { set; get; }
    }
}