using Microsoft.EntityFrameworkCore;
using WriteContext.models;

namespace WriteContext
{
    public class WriteContextDB: DbContext
    {

        public DbSet<User> Users { get; set; }
        public DbSet<PersonalitionSetting> PersonalitionSettings { get; set; }
        public DbSet<NotificationSetting> NotificationSettings { get; set; }
        // public DbSet<RelantionShip> RelantionShips { get; set; }
        public DbSet<Backgrounds> Backgrounds { set; get; }
        public DbSet<Folder> Folders { set; get; }
        public DbSet<Label> Labels { set; get; }
        public DbSet<Note> Notes { set; get; }
        public DbSet<UserOnNote> UserOnNote { set; get; }

        public WriteContextDB(DbContextOptions<WriteContextDB> options) : base(options)
        {


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
                .HasKey(x => new { x.WriteId });
        }
    }
}
