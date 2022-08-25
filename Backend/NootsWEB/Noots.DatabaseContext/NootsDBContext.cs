using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Plan;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using Common.DatabaseModels.Models.WS;
using Microsoft.EntityFrameworkCore;

namespace Noots.DatabaseContext
{
    public class NootsDBContext : DbContext
    {
        // USERS & NOTIFICATIONS
        public DbSet<User> Users { get; set; }

        public DbSet<NotificationSetting> NotificationSettings { get; set; }

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
        public DbSet<AppFile> Files { set; get; }

        public DbSet<CollectionNoteAppFile> CollectionNoteAppFiles { set; get; }
        public DbSet<CollectionNote> CollectionNotes { set; get; }


        public DbSet<FileType> FileTypes { set; get; }

        // NOTE CONTENT
        public DbSet<BaseNoteContent> BaseNoteContents { set; get; }

        public DbSet<TextNote> TextNotes { set; get; }


        // NOTE HISTORY
        public DbSet<NoteSnapshot> NoteSnapshots { set; get; }

        public DbSet<CacheNoteHistory> CacheNoteHistory { set; get; }

        public DbSet<UserNoteSnapshotManyToMany> UserNoteHistoryManyToMany { set; get; }

        // WS
        public DbSet<UserIdentifierConnectionId> UserIdentifierConnectionId { set; get; }

        // SYSTEMS
        public DbSet<Language> Languages { set; get; }

        public DbSet<Theme> Themes { set; get; }

        public DbSet<FontSize> FontSizes { set; get; }

        public DbSet<RefType> RefTypes { set; get; }

        public DbSet<FolderType> FoldersTypes { set; get; }

        public DbSet<NoteType> NotesTypes { set; get; }

        public DbSet<BillingPlan> BillingPlans { set; get; }

        public DbSet<HType> HTypes { set; get; }

        public DbSet<NoteTextType> NoteTextTypes { set; get; }

        public DbSet<ContentType> ContentTypes { set; get; }

        public NootsDBContext(DbContextOptions<NootsDBContext> options) : base(options)
        {
            //Database.EnsureCreated();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("Noots");

            // CONTENT

            modelBuilder.Entity<BaseNoteContent>()
                .HasOne(x => x.Note)
                .WithMany(x => x.Contents)
                .OnDelete(DeleteBehavior.Cascade);

            // USER

            modelBuilder.Entity<User>().HasIndex(x => new { x.Email }).IsUnique();

            modelBuilder.Entity<User>()
                .HasOne(x => x.CurrentBackground)
                .WithOne(z => z.CurrentUserBackground)
                .HasForeignKey<User>(h => h.CurrentBackgroundId);

            modelBuilder.Entity<User>()
                .HasOne(x => x.UserProfilePhoto)
                .WithOne(z => z.User)
                .HasForeignKey<UserProfilePhoto>(h => h.UserId);

            modelBuilder.Entity<UserProfilePhoto>()
                .HasKey(x => x.UserId);

            // WS
            modelBuilder.Entity<UserIdentifierConnectionId>().HasKey(x => new { x.Id });

            // PersonalizationSetting

            modelBuilder.Entity<PersonalizationSetting>()
                .Property(b => b.NotesInFolderCount)
                .HasDefaultValue(5);

            modelBuilder.Entity<PersonalizationSetting>()
                .HasOne(x => x.SortedFolderByType)
                .WithMany(x => x.PersonalizationSettingsFolders)
                .HasForeignKey(x => x.SortedFolderByTypeId);

            modelBuilder.Entity<PersonalizationSetting>()
                .HasOne(x => x.SortedNoteByType)
                .WithMany(x => x.PersonalizationSettingsNotes)
                .HasForeignKey(x => x.SortedNoteByTypeId);

            // ----------------------------------------


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

            modelBuilder.Entity<Note>()
                .HasKey(x => new { x.Id });

            modelBuilder.Entity<LabelsNotes>()
                .HasKey(bc => new { bc.NoteId, bc.LabelId });

            modelBuilder.Entity<LabelsNotes>()
                .HasOne(bc => bc.Label)
                .WithMany(b => b.LabelsNotes)
                .HasForeignKey(bc => bc.LabelId);

            modelBuilder.Entity<LabelsNotes>()
                .HasOne(bc => bc.Note)
                .WithMany(c => c.LabelsNotes)
                .HasForeignKey(bc => bc.NoteId);

            modelBuilder.Entity<CacheNoteHistory>()
                .HasKey(bc => new { bc.NoteId });


            modelBuilder.Entity<FoldersNotes>()
                .HasKey(bc => new { bc.NoteId, bc.FolderId });

            modelBuilder.Entity<FoldersNotes>()
                .HasOne(bc => bc.Folder)
                .WithMany(b => b.FoldersNotes)
                .HasForeignKey(bc => bc.FolderId);

            modelBuilder.Entity<FoldersNotes>()
                .HasOne(bc => bc.Note)
                .WithMany(c => c.FoldersNotes)
                .HasForeignKey(bc => bc.NoteId);

            modelBuilder.Entity<UserOnPrivateNotes>()
                .HasKey(bc => new { bc.NoteId, bc.UserId });

            modelBuilder.Entity<UserOnPrivateNotes>()
                .HasOne(bc => bc.Note)
                .WithMany(b => b.UsersOnPrivateNotes)
                .HasForeignKey(bc => bc.NoteId);

            modelBuilder.Entity<UserOnPrivateNotes>()
                .HasOne(bc => bc.User)
                .WithMany(b => b.UserOnPrivateNotes)
                .HasForeignKey(bc => bc.UserId);

            modelBuilder.Entity<UsersOnPrivateFolders>()
                .HasKey(bc => new { bc.FolderId, bc.UserId });

            modelBuilder.Entity<UsersOnPrivateFolders>()
                .HasOne(bc => bc.Folder)
                .WithMany(b => b.UsersOnPrivateFolders)
                .HasForeignKey(bc => bc.FolderId);

            modelBuilder.Entity<UsersOnPrivateFolders>()
                .HasOne(bc => bc.User)
                .WithMany(b => b.UsersOnPrivateFolders)
                .HasForeignKey(bc => bc.UserId);

            // RELATION NOTES

            modelBuilder.Entity<RelatedNoteUserState>()
                .HasKey(bc => new { bc.UserId, bc.ReletatedNoteInnerNoteId });

            modelBuilder.Entity<RelatedNoteToInnerNote>()
                .HasOne(bc => bc.Note)
                .WithMany(b => b.ReletatedNoteToInnerNotesFrom)
                .HasForeignKey(bc => bc.NoteId);

            modelBuilder.Entity<RelatedNoteToInnerNote>()
                .HasOne(bc => bc.RelatedNote)
                .WithMany(b => b.ReletatedNoteToInnerNotesTo)
                .HasForeignKey(bc => bc.RelatedNoteId);


            modelBuilder.Entity<CollectionNote>()
                .HasMany(p => p.Files)
                .WithMany(p => p.PhotosCollectionNotes)
                .UsingEntity<CollectionNoteAppFile>(
                    j => j
                        .HasOne(pt => pt.AppFile)
                        .WithMany(t => t.PhotosCollectionNoteAppFiles)
                        .HasForeignKey(pt => pt.AppFileId),
                    j => j
                        .HasOne(pt => pt.CollectionNote)
                        .WithMany(p => p.CollectionNoteAppFiles)
                        .HasForeignKey(pt => pt.CollectionNoteId),
                    j =>
                    {
                        j.HasKey(bc => new { bc.CollectionNoteId, bc.AppFileId });
                    });


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

            modelBuilder.Entity<User>()
                .HasMany(p => p.NoteHistories)
                .WithMany(p => p.Users)
                .UsingEntity<UserNoteSnapshotManyToMany>(
                    j => j
                        .HasOne(pt => pt.NoteSnapshot)
                        .WithMany(t => t.UserHistories)
                        .HasForeignKey(pt => pt.NoteSnapshotId),
                    j => j
                        .HasOne(pt => pt.User)
                        .WithMany(p => p.UserHistories)
                        .HasForeignKey(pt => pt.UserId),
                    j =>
                    {
                        j.HasKey(bc => new { bc.UserId, bc.NoteSnapshotId });
                    });



            modelBuilder.Entity<Notification>()
                .HasOne(m => m.UserFrom)
                .WithMany(t => t.NotificationsFrom)
                .HasForeignKey(m => m.UserFromId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(m => m.UserTo)
                .WithMany(t => t.NotificationsTo)
                .HasForeignKey(m => m.UserToId)
                .OnDelete(DeleteBehavior.Restrict);

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
                    MaxSize = 1048576000, // 1000 MB
                    MaxLabels = 500,
                    MaxNotes = 250,
                    MaxFolders = 250,
                    MaxRelatedNotes = 5,
                    Price = 0
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
                    Price = 1.5
                    // last snapshots?
                    // personalization?
                    // memory
                });

            modelBuilder.Entity<HType>().HasData(
                new HType { Id = HTypeENUM.H1, Name = nameof(HTypeENUM.H1) },
                new HType { Id = HTypeENUM.H2, Name = nameof(HTypeENUM.H2) },
                new HType { Id = HTypeENUM.H3, Name = nameof(HTypeENUM.H3) }
            );

            modelBuilder.Entity<SortedByType>().HasData(
                new SortedByType { Id = SortedByENUM.AscDate, Name = nameof(SortedByENUM.AscDate) },
                new SortedByType { Id = SortedByENUM.DescDate, Name = nameof(SortedByENUM.DescDate) },
                new SortedByType { Id = SortedByENUM.CustomOrder, Name = nameof(SortedByENUM.CustomOrder) }
            );

            modelBuilder.Entity<NoteTextType>().HasData(
                new NoteTextType { Id = NoteTextTypeENUM.Default, Name = nameof(NoteTextTypeENUM.Default) },
                new NoteTextType { Id = NoteTextTypeENUM.Heading, Name = nameof(NoteTextTypeENUM.Heading) },
                new NoteTextType { Id = NoteTextTypeENUM.Dotlist, Name = nameof(NoteTextTypeENUM.Dotlist) },
                new NoteTextType { Id = NoteTextTypeENUM.Numberlist, Name = nameof(NoteTextTypeENUM.Numberlist) },
                new NoteTextType { Id = NoteTextTypeENUM.Checklist, Name = nameof(NoteTextTypeENUM.Checklist) }
            );

            modelBuilder.Entity<ContentType>().HasData(
                new ContentType { Id = ContentTypeENUM.Text, Name = nameof(ContentTypeENUM.Text) },
                new ContentType { Id = ContentTypeENUM.Collection, Name = nameof(ContentTypeENUM.Collection) }
             );
        }
    }
}
