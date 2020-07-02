using Microsoft.EntityFrameworkCore;
using WriteContext.models;

namespace WriteContext
{
    public class WriteContextDB: DbContext
    {

        public DbSet<User> Users { get; set; }
        public DbSet<PersonalitionSetting> PersonalitionSettings { get; set; }
        public DbSet<NotificationSetting> NotificationSettings { get; set; }
        public DbSet<RelantionShip> RelantionShips { get; set; }

        public WriteContextDB(DbContextOptions<WriteContextDB> options) : base(options)
        {

        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RelantionShip>()
                .HasKey(x => new { x.FirstUserId, x.SecondUserId});
        }
    }
}
