using Common.DatabaseModels.models.Files;
using Common.DatabaseModels.models.Folders;
using Common.DatabaseModels.models.History;
using Common.DatabaseModels.models.Labels;
using Common.DatabaseModels.models.NoteContent;
using Common.DatabaseModels.models.Notes;
using Common.DatabaseModels.models.Plan;
using Common.DatabaseModels.models.Systems;
using Common.DatabaseModels.models.Users;
using Common.Naming;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace WriteContext
{
    public class WriteContextDB : DbContext
    {
        // USERS & NOTIFICATIONS
        public DbSet<User> Users { get; set; }
        public DbSet<NotificationSetting> NotificationSettings { get; set; }
        public DbSet<Backgrounds> Backgrounds { set; get; }
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
        public DbSet<ReletatedNoteToInnerNote> ReletatedNoteToInnerNotes { set; get; }
        public DbSet<UserOnNoteNow> UserOnNoteNow { set; get; }
        public DbSet<UserOnPrivateNotes> UserOnPrivateNotes { set; get; }


        // FILES
        public DbSet<AppFile> Files { set; get; }
        public DbSet<AlbumNoteAppFile> AlbumNoteAppFiles { set; get; }
        public DbSet<FileType> FileTypes { set; get; }

        // NOTE CONTENT
        public DbSet<BaseNoteContent> BaseNoteContents { set; get; }
        public DbSet<TextNote> TextNotes { set; get; }
        public DbSet<AlbumNote> AlbumNotes { set; get; }
        public DbSet<AudioNote> AudiosNote { set; get; }
        public DbSet<VideoNote> VideosNote { set; get; }
        public DbSet<DocumentNote> DocumentsNote { set; get; }

        // NOTE HISTORY
        public DbSet<NoteHistory> NoteHistories { set; get; }
        public DbSet<UserNoteHistoryManyToMany> UserNoteHistoryManyToMany { set; get; }

        // SYSTEMS
        public DbSet<Language> Languages { set; get; }
        public DbSet<Theme> Themes { set; get; }
        public DbSet<FontSize> FontSizes { set; get; }
        public DbSet<RefType> RefTypes { set; get; }
        public DbSet<FolderType> FoldersTypes { set; get; }
        public DbSet<NoteType> NotesTypes { set; get; }
        public DbSet<BillingPlan> BillingPlans { set; get; }

        public WriteContextDB(DbContextOptions<WriteContextDB> options) : base(options)
        {
            //Database.EnsureCreated();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

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

            modelBuilder.Entity<FileType>()
                .HasMany(x => x.AppFiles)
                .WithOne(x => x.FileType)
                .HasForeignKey(x => x.FileTypeId);


            modelBuilder.Entity<AppFile>()
                .HasOne(x => x.User)
                .WithMany(z => z.Files)
                .HasForeignKey(h => h.UserId);

            modelBuilder.Entity<Note>()
                .HasKey(x => new { x.Id });

            modelBuilder.Entity<UserOnNoteNow>()
                .HasKey(x => new { x.UserId, x.NoteId });

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

            modelBuilder.Entity<ReletatedNoteToInnerNote>()
                .HasKey(bc => new { bc.NoteId, bc.RelatedNoteId });

            modelBuilder.Entity<ReletatedNoteToInnerNote>()
                .HasOne(bc => bc.Note)
                .WithMany(b => b.ReletatedNoteToInnerNotesFrom)
                .HasForeignKey(bc => bc.NoteId);

            modelBuilder.Entity<ReletatedNoteToInnerNote>()
                .HasOne(bc => bc.RelatedNote)
                .WithMany(b => b.ReletatedNoteToInnerNotesTo)
                .HasForeignKey(bc => bc.RelatedNoteId);


            modelBuilder.Entity<AlbumNote>()
                .HasMany(p => p.Photos)
                .WithMany(p => p.AlbumNotes)
                .UsingEntity<AlbumNoteAppFile>(
                    j => j
                        .HasOne(pt => pt.AppFile)
                        .WithMany(t => t.AlbumNoteAppFiles)
                        .HasForeignKey(pt => pt.AppFileId),
                    j => j
                        .HasOne(pt => pt.AlbumNote)
                        .WithMany(p => p.AlbumNoteAppFiles)
                        .HasForeignKey(pt => pt.AlbumNoteId),
                    j =>
                    {
                        j.HasKey(bc => new { bc.AlbumNoteId, bc.AppFileId });
                    });


           
            modelBuilder.Entity<User>()
                .HasMany(p => p.NoteHistories)
                .WithMany(p => p.Users)
                .UsingEntity<UserNoteHistoryManyToMany>(
                    j => j
                        .HasOne(pt => pt.NoteHistory)
                        .WithMany(t => t.UserHistories)
                        .HasForeignKey(pt => pt.NoteHistoryId),
                    j => j
                        .HasOne(pt => pt.User)
                        .WithMany(p => p.UserHistories)
                        .HasForeignKey(pt => pt.UserId),
                    j =>
                    {
                        j.HasKey(bc => new { bc.UserId, bc.NoteHistoryId });
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
                new FileType { Id = FileTypeEnum.Text, Name = nameof(FileTypeEnum.Text) },
                new FileType { Id = FileTypeEnum.Audio, Name = nameof(FileTypeEnum.Audio) },
                new FileType { Id = FileTypeEnum.Photo, Name = nameof(FileTypeEnum.Photo) },
                new FileType { Id = FileTypeEnum.Video, Name = nameof(FileTypeEnum.Video) },
                new FileType { Id = FileTypeEnum.Document, Name = nameof(FileTypeEnum.Document) }
                );

            modelBuilder.Entity<Language>().HasData(
                new Language { Id = Guid.Parse("38b402a0-e1b1-42d7-b472-db788a1a3924"), Name = ModelsNaming.Ukraine },
                new Language { Id = Guid.Parse("01a4f567-b5cd-4d98-8d55-b49df9415d99"), Name = ModelsNaming.Russian },
                new Language  { Id = Guid.Parse("6579263d-c4db-446a-8223-7d895dc45f1b"), Name = ModelsNaming.English });

            modelBuilder.Entity<Theme>().HasData(
                new Theme  { Id = Guid.Parse("5b08dced-b041-4a77-b290-f08e36af1d70"), Name = ModelsNaming.LightTheme },
                new Theme  { Id = Guid.Parse("f52a188b-5422-4144-91f6-bde40b82ce22"), Name = ModelsNaming.DarkTheme });

            modelBuilder.Entity<FontSize>().HasData(
                new FontSize  { Id = Guid.Parse("5c335a93-7aa7-40ff-b995-6c90f2536e98"), Name = ModelsNaming.Medium },
                new FontSize  { Id = Guid.Parse("656e1f08-bb0e-406c-a0b9-77dc3e10a86b"), Name = ModelsNaming.Big });



            modelBuilder.Entity<FolderType>().HasData(
                new FolderType  { Id = Guid.Parse("381428f6-0568-4fb4-9c86-2d9e0f381308"), Name = ModelsNaming.PrivateFolder },
                new FolderType  { Id = Guid.Parse("96c416cd-94d1-4f6c-9dd6-3b1f1e1e14e9"), Name = ModelsNaming.SharedFolder },
                new FolderType  { Id = Guid.Parse("e3ea1cb2-5301-42fd-b283-2fe6133755c1"), Name = ModelsNaming.DeletedFolder },
                new FolderType  { Id = Guid.Parse("3e00dc8e-1030-4022-bc73-9d5c13b363d3"), Name = ModelsNaming.ArchivedFolder });

            modelBuilder.Entity<NoteType>().HasData(
                new NoteType  { Id = Guid.Parse("d01e34ef-3bc0-4fd4-b4cf-0996101e9d87"), Name = ModelsNaming.PrivateNote },
                new NoteType  { Id = Guid.Parse("ad503d43-c28e-405a-aa20-bcb4e2b1a2a5"), Name = ModelsNaming.SharedNote },
                new NoteType  { Id = Guid.Parse("1f384f3c-1aa8-4664-ac8d-e264e68164dc"), Name = ModelsNaming.DeletedNote },
                new NoteType  { Id = Guid.Parse("556a3f0d-1edd-4ccc-bd7e-b087b033849a"), Name = ModelsNaming.ArchivedNote });

            modelBuilder.Entity<RefType>().HasData(
                new RefType  { Id = Guid.Parse("7c247026-36c6-4c17-b227-afb37e8ec7cd"), Name = ModelsNaming.Viewer },
                new RefType  { Id = Guid.Parse("397821bf-74d5-4bdf-81e4-0698d5a92476"), Name = ModelsNaming.Editor });

            modelBuilder.Entity<BillingPlan>().HasData(
                new BillingPlan  { Id = Guid.Parse("8984401e-5e3a-454c-a05c-17f9cc848598"), Name = ModelsNaming.Billing_Basic, MaxSize = 100000000 },
                new BillingPlan  { Id = Guid.Parse("00c89cbe-ac11-4149-a837-b30b68f5cfc1"), Name = ModelsNaming.Billing_Standart, MaxSize = 500000000 },
                new BillingPlan  { Id = Guid.Parse("8af89b1d-1d73-422e-8709-d3b9e4e050d9"), Name = ModelsNaming.Billing_Business, MaxSize = 1000000000 });

        }
    }
}
