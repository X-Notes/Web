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

        public async Task Add(Backgrounds background)
        {
            await contextDB.Backgrounds.AddAsync(background);
            await contextDB.SaveChangesAsync();
        }
    }
}
