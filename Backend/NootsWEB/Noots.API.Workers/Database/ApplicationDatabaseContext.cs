using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Noots.API.Workers.Database.Models;
using Noots.API.Workers.Database.Seed;

namespace Noots.API.Workers.Database
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
