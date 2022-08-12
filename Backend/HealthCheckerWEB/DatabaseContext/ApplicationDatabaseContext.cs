using DatabaseContext.Models;
using DatabaseContext.Seed;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace DatabaseContext
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
