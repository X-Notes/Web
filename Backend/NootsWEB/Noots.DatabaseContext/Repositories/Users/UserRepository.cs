using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Users;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DatabaseContext.Repositories.Users
{
    // TODO OPTIMIZATION SQL QUERY
    public class UserRepository : Repository<User, Guid>
    {
        private readonly ILogger<UserRepository> logger;

        public UserRepository(ApiDbContext contextDB, ILogger<UserRepository> logger)
            : base(contextDB)
        {
            this.logger = logger;
        }

        public Task<User> GetUserByIdIncludeBilling(Guid id)
        {
            return context.Users
                .Include(x => x.BillingPlan)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task<User> GetUserByEmailIncludeBackgroundAndPhoto(Guid userId)
        {
            return context.Users
                .Include(x => x.CurrentBackground)
                .ThenInclude(x => x.File)
                .Include(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .FirstOrDefaultAsync(x => x.Id == userId);
        }

        public Task<User> GetUserByEmailIncludePhoto(Guid userId)
        {
            return context.Users
                .Include(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .FirstOrDefaultAsync(x => x.Id == userId);
        }

        public Task<User> GetUserWithBackgrounds(Guid userId)
        {
            return context.Users.Include(x => x.Backgrounds).ThenInclude(x => x.File).FirstOrDefaultAsync(x => x.Id == userId);
        }

        public Task<List<User>> SearchByEmailAndName(string search, Guid userId, int? take)
        {
            var query = context.Users
                .Where(x => x.Email.ToLower().Contains(search) || x.Name.ToLower().Contains(search))
                .Where(x => x.Id != userId)
                .Include(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile);
            if (take.HasValue)
            {
                return query.Take(take.Value).ToListAsync();
            }
            return query.ToListAsync();
        }
        
        public Task<List<User>> GetUsersWithPhotos(IEnumerable<Guid> ids) => 
             entities.Where(x => ids.Contains(x.Id))
            .Include(x => x.UserProfilePhoto)
            .ThenInclude(x => x.AppFile)
            .ToListAsync();


        public async Task<bool> UpdatePhoto(User user, AppFile file)
        {
            var success = true;
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    await context.Files.AddAsync(file);
                    await context.SaveChangesAsync();

                    await context.UserProfilePhotos.AddAsync(new UserProfilePhoto { AppFileId = file.Id, UserId = user.Id });
                    await context.SaveChangesAsync();

                    await transaction.CommitAsync();

                }
                catch (Exception e)
                {
                    logger.LogError(e.ToString());
                    await transaction.RollbackAsync();
                    success = false;
                }
            }
            return success;
        }
    }
}
