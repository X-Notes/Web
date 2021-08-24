using System;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Users;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Users
{
    public class BackgroundRepository : Repository<Background, Guid>
    {
        public BackgroundRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
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
                    Console.WriteLine(e);
                    // TODO ADD LOGGING
                    await transaction.RollbackAsync();
                    success = false;
                }
            }
            return success;
        }
    }
}
