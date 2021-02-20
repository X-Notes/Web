using Common.DatabaseModels.models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WriteContext.Repositories
{
    public class AppRepository
    {
        private readonly WriteContextDB contextDB;
        public AppRepository(WriteContextDB contextDB)
        {
            this.contextDB = contextDB;
        }

        public async Task<List<Language>> GetLanguages()
        {
            return await contextDB.Languages.ToListAsync();
        }

        public async Task<Language> GetLanguageByName(string name)
        {
            return await contextDB.Languages.FirstOrDefaultAsync(x => x.Name == name);
        }
    }
}
