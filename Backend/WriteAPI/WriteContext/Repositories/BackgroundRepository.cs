using Common.DatabaseModels.models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace WriteContext.Repositories
{
    public class BackgroundRepository
    {
        private readonly WriteContextDB contextDB;
        public BackgroundRepository(WriteContextDB contextDB)
        {
            this.contextDB = contextDB;
        }

        public async Task DeleteBackground(Backgrounds item)
        {
            this.contextDB.Remove(item);
            await this.contextDB.SaveChangesAsync();
        }

        public async Task<bool> Add(Backgrounds background, AppFile file)
        {
            var success = true;
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    await contextDB.Files.AddAsync(file);
                    await contextDB.SaveChangesAsync();

                    background.FileId = file.Id;

                    await contextDB.Backgrounds.AddAsync(background);

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
