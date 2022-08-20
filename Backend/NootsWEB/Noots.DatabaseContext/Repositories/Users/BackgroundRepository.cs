using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Users;
using Microsoft.Extensions.Logging;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Users
{
    public class BackgroundRepository : Repository<Background, Guid>
    {
        private readonly ILogger<BackgroundRepository> logger;

        public BackgroundRepository(NootsDBContext contextDB, ILogger<BackgroundRepository> logger)
            : base(contextDB)
        {
            this.logger = logger;
        }

        public async Task<bool> AddBackground(Background background, AppFile file)
        {
            var success = true;
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    await context.Files.AddAsync(file);
                    await context.SaveChangesAsync();

                    background.FileId = file.Id;

                    await context.Backgrounds.AddAsync(background);
                    await context.SaveChangesAsync();
                    
                    await transaction.CommitAsync();

                }
                catch (Exception e)
                {
                    logger.LogError(e.ToString());
                    // TODO ADD LOGGING
                    await transaction.RollbackAsync();
                    success = false;
                }
            }
            return success;
        }
    }
}
