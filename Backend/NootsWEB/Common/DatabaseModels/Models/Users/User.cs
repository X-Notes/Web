using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Files.Models;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Plan;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.WS;

namespace Common.DatabaseModels.Models.Users
{
    [Table(nameof(User), Schema = SchemeConfig.User)]
    public class User : BaseEntity<Guid>
    {
        public string Name { set; get; }

        [Required]
        public string Email { set; get; }

        public UserProfilePhoto UserProfilePhoto { set; get; }

        public List<AppFile> Files { set; get; }

        public string DefaultPhotoUrl { set; get; }

        public LanguageENUM LanguageId { set; get; }
        public Language Language { set; get; }

        public NotificationSetting NotificationSettings { set; get; }

        public PersonalizationSetting PersonalizationSetting { set; get; }

        public List<Label> Labels { set; get; }

        public List<UserIdentifierConnectionId> UserIdentifierConnectionIds { set; get; }

        public List<Background> Backgrounds { set; get; }

        public Guid? CurrentBackgroundId { set; get; }
        public Background CurrentBackground { set; get; }

        public ThemeENUM ThemeId { set; get; }
        public Theme Theme { set; get; }

        public FontSizeENUM FontSizeId { set; get; }
        public FontSize FontSize { set; get; }

        public List<Folder> Folders { set; get; }
        public List<Note> Notes { set; get; }

        public List<UserOnPrivateNotes> UserOnPrivateNotes { set; get; }

        public List<UsersOnPrivateFolders> UsersOnPrivateFolders { set; get; }

        public List<Notification> NotificationsFrom { set; get; }
        public List<Notification> NotificationsTo { set; get; }

        public List<NoteSnapshot> NoteHistories { set; get; }

        public List<UserNoteSnapshotManyToMany> UserHistories { set; get; }

        public BillingPlanTypeENUM BillingPlanId { set; get; }
        public BillingPlan BillingPlan { set; get; }

        public StoragesEnum StorageId { set; get; }
        public Storage Storage { get; set; }

        public List<RelatedNoteUserState> RelatedNoteUserStates { set; get; }
    }
}
