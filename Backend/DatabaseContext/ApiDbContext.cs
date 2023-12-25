using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Files.Models;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Plan;
using Common.DatabaseModels.Models.Security;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using Common.DatabaseModels.Models.Users.Notifications;
using Common.DatabaseModels.Models.WS;
using DatabaseContext.Configurations;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext
{
    public class ApiDbContext : DbContext
    {
        // USERS & NOTIFICATIONS
        public DbSet<User> Users { get; set; }

        public DbSet<PersonalizationSetting> PersonalizationSettings { set; get; }

        public DbSet<SortedByType> SortedByTypes { set; get; }

        public DbSet<Background> Backgrounds { set; get; }

        public DbSet<Notification> Notifications { set; get; }

        public DbSet<UserProfilePhoto> UserProfilePhotos { set; get; }

        // FOLDERS
        public DbSet<Folder> Folders { set; get; }

        public DbSet<FoldersNotes> FoldersNotes { set; get; }

        public DbSet<UsersOnPrivateFolders> UsersOnPrivateFolders { set; get; }

        // LABELS
        public DbSet<Label> Labels { set; get; }

        public DbSet<LabelsNotes> LabelsNotes { set; get; }

        // NOTES
        public DbSet<Note> Notes { set; get; }

        public DbSet<RelatedNoteToInnerNote> ReletatedNoteToInnerNotes { set; get; }

        public DbSet<RelatedNoteUserState> RelatedNoteUserState { set; get; }

        public DbSet<UserOnPrivateNotes> UserOnPrivateNotes { set; get; }

        // FILES

        public DbSet<Storage> Storages { set; get; }
        public DbSet<AppFile> Files { set; get; }

        public DbSet<CollectionNoteAppFile> CollectionNoteAppFiles { set; get; }

        public DbSet<FileType> FileTypes { set; get; }

        // NOTE CONTENT
        public DbSet<BaseNoteContent> BaseNoteContents { set; get; }


        // NOTE HISTORY
        public DbSet<NoteSnapshot> NoteSnapshots { set; get; }

        public DbSet<CacheNoteHistory> CacheNoteHistory { set; get; }

        public DbSet<UserNoteSnapshotManyToMany> UserNoteHistoryManyToMany { set; get; }

        // WS
        public DbSet<UserIdentifierConnectionId> UserIdentifierConnectionId { set; get; }

        public DbSet<NoteConnection> NoteConnection { set; get; }

        public DbSet<FolderConnection> FolderConnection { set; get; }

        // SYSTEMS
        public DbSet<Language> Languages { set; get; }

        public DbSet<Theme> Themes { set; get; }

        public DbSet<FontSize> FontSizes { set; get; }

        public DbSet<RefType> RefTypes { set; get; }

        public DbSet<FolderType> FoldersTypes { set; get; }

        public DbSet<NoteType> NotesTypes { set; get; }

        public DbSet<BillingPlan> BillingPlans { set; get; }

        public DbSet<ContentType> ContentTypes { set; get; }

        // SEC
        public DbSet<RefreshToken> RefreshTokens { set; get; }

        public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
        {
            //Database.EnsureCreated();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(NoteConfiguration).Assembly);

            // TextNoteIndex
            modelBuilder.Entity<TextNoteIndex>().HasKey(x => x.BaseNoteContentId);

            // USER PROFILE
            modelBuilder.Entity<UserProfilePhoto>().HasKey(x => x.UserId);

            // RefreshToken
            modelBuilder.Entity<RefreshToken>().HasKey(bc => new { bc.UserId, bc.TokenString });

            // WS
            modelBuilder.Entity<UserIdentifierConnectionId>().HasKey(x => new { x.Id });

            modelBuilder.Entity<FileType>()
                .HasMany(x => x.AppFiles)
                .WithOne(x => x.FileType)
                .HasForeignKey(x => x.FileTypeId);

            modelBuilder.Entity<AppFileUploadInfo>()
                .HasKey(x => x.AppFileId);

            modelBuilder.Entity<AppFile>()
                .HasOne(x => x.User)
                .WithMany(z => z.Files)
                .HasForeignKey(h => h.UserId);

            modelBuilder.Entity<CacheNoteHistory>()
                .HasKey(bc => new { bc.NoteId });

            // RELATION NOTES

            modelBuilder.Entity<RelatedNoteUserState>()
                .HasKey(bc => new { bc.UserId, bc.RelatedNoteInnerNoteId });

            modelBuilder.Entity<RelatedNoteToInnerNote>()
                .HasOne(bc => bc.Note)
                .WithMany(b => b.ReletatedNoteToInnerNotesFrom)
                .HasForeignKey(bc => bc.NoteId);

            modelBuilder.Entity<RelatedNoteToInnerNote>()
                .HasOne(bc => bc.RelatedNote)
                .WithMany(b => b.ReletatedNoteToInnerNotesTo)
                .HasForeignKey(bc => bc.RelatedNoteId);

            modelBuilder.Entity<NoteSnapshot>()
                .HasMany(x => x.AppFiles)
                .WithMany(x => x.NoteSnapshots)
                .UsingEntity<SnapshotFileContent>(
                    j => j
                            .HasOne(pt => pt.AppFile)
                            .WithMany(t => t.SnapshotFileContents)
                            .HasForeignKey(pt => pt.AppFileId),
                    j => j
                            .HasOne(pt => pt.NoteSnapshot)
                            .WithMany(p => p.SnapshotFileContents)
                            .HasForeignKey(pt => pt.NoteSnapshotId),
                    j =>
                    {
                        j.HasKey(bc => new { bc.NoteSnapshotId, bc.AppFileId });
                    });

            modelBuilder.Entity<FileType>().HasData(
                new FileType { Id = FileTypeEnum.Audio, Name = nameof(FileTypeEnum.Audio) },
                new FileType { Id = FileTypeEnum.Photo, Name = nameof(FileTypeEnum.Photo) },
                new FileType { Id = FileTypeEnum.Video, Name = nameof(FileTypeEnum.Video) },
                new FileType { Id = FileTypeEnum.Document, Name = nameof(FileTypeEnum.Document) }
                );

            modelBuilder.Entity<Language>().HasData(
                new Language { Id = LanguageENUM.English, Name = nameof(LanguageENUM.English) },
                new Language { Id = LanguageENUM.Ukraine, Name = nameof(LanguageENUM.Ukraine) },
                new Language { Id = LanguageENUM.Russian, Name = nameof(LanguageENUM.Russian) },
                new Language { Id = LanguageENUM.Spanish, Name = nameof(LanguageENUM.Spanish) },
                new Language { Id = LanguageENUM.French, Name = nameof(LanguageENUM.French) },
                new Language { Id = LanguageENUM.Italian, Name = nameof(LanguageENUM.Italian) },
                new Language { Id = LanguageENUM.German, Name = nameof(LanguageENUM.German) },
                new Language { Id = LanguageENUM.Swedish, Name = nameof(LanguageENUM.Swedish) },
                new Language { Id = LanguageENUM.Polish, Name = nameof(LanguageENUM.Polish) },
                new Language { Id = LanguageENUM.Chinese, Name = nameof(LanguageENUM.Chinese) },
                new Language { Id = LanguageENUM.Japan, Name = nameof(LanguageENUM.Japan) }
                );

            modelBuilder.Entity<Theme>().HasData(
                new Theme { Id = ThemeENUM.Dark, Name = nameof(ThemeENUM.Dark) },
                new Theme { Id = ThemeENUM.Light, Name = nameof(ThemeENUM.Light) });

            modelBuilder.Entity<FontSize>().HasData(
                new FontSize { Id = FontSizeENUM.Medium, Name = nameof(FontSizeENUM.Medium) },
                new FontSize { Id = FontSizeENUM.Big, Name = nameof(FontSizeENUM.Big) });

            modelBuilder.Entity<FolderType>().HasData(
                new FolderType { Id = FolderTypeENUM.Private, Name = nameof(FolderTypeENUM.Private) },
                new FolderType { Id = FolderTypeENUM.Shared, Name = nameof(FolderTypeENUM.Shared) },
                new FolderType { Id = FolderTypeENUM.Archived, Name = nameof(FolderTypeENUM.Archived) },
                new FolderType { Id = FolderTypeENUM.Deleted, Name = nameof(FolderTypeENUM.Deleted) });

            modelBuilder.Entity<NoteType>().HasData(
                new NoteType { Id = NoteTypeENUM.Private, Name = nameof(NoteTypeENUM.Private) },
                new NoteType { Id = NoteTypeENUM.Shared, Name = nameof(NoteTypeENUM.Shared) },
                new NoteType { Id = NoteTypeENUM.Archived, Name = nameof(NoteTypeENUM.Archived) },
                new NoteType { Id = NoteTypeENUM.Deleted, Name = nameof(NoteTypeENUM.Deleted) });

            modelBuilder.Entity<RefType>().HasData(
                new RefType { Id = RefTypeENUM.Viewer, Name = nameof(RefTypeENUM.Viewer) },
                new RefType { Id = RefTypeENUM.Editor, Name = nameof(RefTypeENUM.Editor) });

            modelBuilder.Entity<BillingPlan>().HasData(
                new BillingPlan
                {
                    Id = BillingPlanTypeENUM.Standart,
                    Name = nameof(BillingPlanTypeENUM.Standart),
                    MaxSize = 104857600, // 100 MB
                    MaxLabels = 100,
                    MaxNotes = 160,
                    MaxFolders = 40,
                    MaxRelatedNotes = 5,
                    Price = 0,
                    MaxBackgrounds = 10,
                },
                new BillingPlan
                {
                    Id = BillingPlanTypeENUM.Premium,
                    Name = nameof(BillingPlanTypeENUM.Premium),
                    MaxSize = 5242880000, // 5000 MB
                    MaxLabels = 10000,
                    MaxNotes = 10000,
                    MaxFolders = 10000,
                    MaxRelatedNotes = 30,
                    Price = 1.5,
                    MaxBackgrounds = 20,
                    // last snapshots?
                    // personalization?
                    // memory

                });

            modelBuilder.Entity<SortedByType>().HasData(
                new SortedByType { Id = SortedByENUM.AscDate, Name = nameof(SortedByENUM.AscDate) },
                new SortedByType { Id = SortedByENUM.DescDate, Name = nameof(SortedByENUM.DescDate) },
                new SortedByType { Id = SortedByENUM.CustomOrder, Name = nameof(SortedByENUM.CustomOrder) }
            );

            modelBuilder.Entity<ContentType>().HasData(
                new ContentType { Id = ContentTypeENUM.Text, Name = nameof(ContentTypeENUM.Text) },
                new ContentType { Id = ContentTypeENUM.Collection, Name = nameof(ContentTypeENUM.Collection) }
             );

            modelBuilder.Entity<Storage>().HasData(
                new Storage { Id = StoragesEnum.DEV, Name = "DEV" }
             );

            modelBuilder.Entity<NotificationMessages>().HasData(
                new NotificationMessages { Id = NotificationMessagesEnum.ChangeUserPermissionFolderV1, MessageKey = NotificationConstants.ChangeUserPermissionFolder },
                new NotificationMessages { Id = NotificationMessagesEnum.ChangeUserPermissionNoteV1, MessageKey = NotificationConstants.ChangeUserPermissionNote },
                new NotificationMessages { Id = NotificationMessagesEnum.SentInvitesToFolderV1, MessageKey = NotificationConstants.SentInvitesToFolder },
                new NotificationMessages { Id = NotificationMessagesEnum.SentInvitesToNoteV1, MessageKey = NotificationConstants.SentInvitesToNote },
                new NotificationMessages { Id = NotificationMessagesEnum.RemoveUserFromFolderV1, MessageKey = NotificationConstants.RemoveUserFromFolder },
                new NotificationMessages { Id = NotificationMessagesEnum.RemoveUserFromNoteV1, MessageKey = NotificationConstants.RemoveUserFromNote }
             );
        }
    }
}