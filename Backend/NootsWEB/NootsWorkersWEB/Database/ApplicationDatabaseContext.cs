using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NootsWorkersWEB.Database.Models;
using NootsWorkersWEB.Database.Seed;

namespace NootsWorkersWEB.Database
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
