using Common.DatabaseModels.models;
using Common.Naming;
using Microsoft.EntityFrameworkCore;
using System;

namespace WriteContext
{
    public class WriteContextDB : DbContext
    {

        public DbSet<User> Users { get; set; }
        public DbSet<NotificationSetting> NotificationSettings { get; set; }
        public DbSet<Backgrounds> Backgrounds { set; get; }
        public DbSet<Folder> Folders { set; get; }
        public DbSet<Label> Labels { set; get; }
        public DbSet<Note> Notes { set; get; }
        public DbSet<UserOnNoteNow> UserOnNoteNow { set; get; }
        public DbSet<LabelsNotes> LabelsNotes { set; get; }
        public DbSet<AppFile> Files { set; get; }
        public DbSet<Language> Languages { set; get; }
        public DbSet<Theme> Themes { set; get; }
        public DbSet<FolderType> FoldersTypes { set; get; }
        public DbSet<NoteType> NotesTypes { set; get; }
        public DbSet<RefType> RefTypes { set; get; }
        public DbSet<FontSize> FontSizes { set; get; }
        public DbSet<FoldersNotes> FoldersNotes { set; get; }
        public DbSet<UserOnPrivateNotes> UserOnPrivateNotes { set; get; }
        public DbSet<UsersOnPrivateFolders> UsersOnPrivateFolders { set; get; }
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

            modelBuilder.Entity<Language>().HasData(
                new { Id = Guid.NewGuid(), Name = "Ukraine" },
                new { Id = Guid.NewGuid(), Name = "Russian" },
                new { Id = Guid.NewGuid(), Name = "English" });

            modelBuilder.Entity<Theme>().HasData(
                new { Id = Guid.NewGuid(), Name = ModelsNaming.LightTheme },
                new { Id = Guid.NewGuid(), Name = ModelsNaming.DarkTheme });

            modelBuilder.Entity<FontSize>().HasData(
                new { Id = Guid.NewGuid(), Name = ModelsNaming.Medium },
                new { Id = Guid.NewGuid(), Name = ModelsNaming.Big });



            modelBuilder.Entity<FolderType>().HasData(
                new { Id = Guid.NewGuid(), Name = ModelsNaming.PrivateFolder },
                new { Id = Guid.NewGuid(), Name = ModelsNaming.SharedFolder },
                new { Id = Guid.NewGuid(), Name = ModelsNaming.DeletedFolder },
                new { Id = Guid.NewGuid(), Name = ModelsNaming.ArchivedFolder });

            modelBuilder.Entity<NoteType>().HasData(
                new { Id = Guid.NewGuid(), Name = ModelsNaming.PrivateNote },
                new { Id = Guid.NewGuid(), Name = ModelsNaming.SharedNote },
                new { Id = Guid.NewGuid(), Name = ModelsNaming.DeletedNote },
                new { Id = Guid.NewGuid(), Name = ModelsNaming.ArchivedNote });

            modelBuilder.Entity<RefType>().HasData(
                new { Id = Guid.NewGuid(), Name = ModelsNaming.Viewer },
                new { Id = Guid.NewGuid(), Name = ModelsNaming.Editor });
        }
    }
}
