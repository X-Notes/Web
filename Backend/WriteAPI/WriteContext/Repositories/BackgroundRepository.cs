using Common.DatabaseModels.models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class BackgroundRepository : Repository<Backgrounds>
    {
        public BackgroundRepository(WriteContextDB contextDB)
            :base(contextDB)
        {
        }

        public async Task<bool> AddBackground(Backgrounds background, AppFile file)
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

                    await transaction.CommitAsync();

                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    success = false;
                }
            }
            return success;
        }
    }
}
