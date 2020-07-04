using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using WriteContext.models;

namespace WriteContext.Repositories
{
    public class BackgroundRepository
    {
        private readonly WriteContextDB contextDB;
        public BackgroundRepository(WriteContextDB contextDB)
        {
            this.contextDB = contextDB;
        }

        public async Task DeleteBackground(int id)
        {
            var item = this.contextDB.Backgrounds.FirstOrDefaultAsync(x => x.Id == id);
            this.contextDB.Remove(item);
            await this.contextDB.SaveChangesAsync();
        }

        public async Task Add(Backgrounds background)
        {
            await contextDB.AddAsync(background);
            await contextDB.SaveChangesAsync();
        }
    }
}
