using Common.DatabaseModels.models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace WriteContext.Repositories
{
    public class FileRepository
    {
        private readonly WriteContextDB contextDB;
        public FileRepository(WriteContextDB contextDB)
        {
            this.contextDB = contextDB;
        }
        public async Task Add(AppFile file)
        {
            await contextDB.Files.AddAsync(file);
            await contextDB.SaveChangesAsync();
        }

        public async Task<AppFile> GetFileById(Guid id)
        {
            return await this.contextDB.Files.FirstOrDefaultAsync(x => x.Id == id);
        }

    }
}
