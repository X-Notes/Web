using Common.DatabaseModels.models;
using Microsoft.EntityFrameworkCore;
using System;

namespace WriteContext
{
    public class WriteContextDB : DbContext
    {

        public DbSet<User> Users { get; set; }
        public DbSet<PersonalitionSetting> PersonalitionSettings { get; set; }
        public DbSet<NotificationSetting> NotificationSettings { get; set; }
        // public DbSet<RelantionShip> RelantionShips { get; set; }
        public DbSet<Backgrounds> Backgrounds { set; get; }
        public DbSet<Folder> Folders { set; get; }
        public DbSet<Label> Labels { set; get; }
        public DbSet<Note> Notes { set; get; }
        public DbSet<UserOnNoteNow> UserOnNoteNow { set; get; }
        public DbSet<LabelsNotes> LabelsNotes { set; get; }

        public DbSet<FoldersNotes> FoldersNotes { set; get; }
        public DbSet<UserOnPrivateNotes> UserOnPrivateNotes { set; get; }
        public DbSet<UsersOnPrivateFolders> UsersOnPrivateFolders { set; get; }
        public WriteContextDB(DbContextOptions<WriteContextDB> options) : base(options)
        {
            //Database.EnsureCreated();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            /*
            modelBuilder.Entity<RelantionShip>()
                .HasKey(x => new { x.FirstUserId, x.SecondUserId});

            modelBuilder.Entity<RelantionShip>()
                .HasOne(x => x.FirstUser)
                .WithMany(y => y.FriendRequestsMade)
                .HasForeignKey(x => x.FirstUserId).OnDelete(DeleteBehavior.Restrict);

            
            modelBuilder.Entity<RelantionShip>()
                .HasOne(x => x.SecondUser)
                .WithMany(y => y.FriendRequestsAccepted)
                .HasForeignKey(x => x.SecondUserId);
                
            modelBuilder.Entity<RelantionShip>()
                .HasOne(e => e.ActionUser)
                .WithOne().HasForeignKey<RelantionShip>(e => e.ActionUserId);
                */

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
        }
    }
}
