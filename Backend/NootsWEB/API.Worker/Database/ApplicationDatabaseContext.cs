using API.Worker.Database.Models;
using API.Worker.Database.Seed;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Worker.Database
{
    public class ApplicationDatabaseContext : IdentityDbContext<User, Role, int>
    {
        public ApplicationDatabaseContext(DbContextOptions<ApplicationDatabaseContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            DatabaseInitializer.SeedDatabase(builder);
        }
    }
}
