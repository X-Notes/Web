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

        public async Task<List<FontSize>> GetFontSizes()
        {
            return await contextDB.FontSizes.ToListAsync();
        }

        public async Task<FontSize> GetFontSizeByName(string name)
        {
            return await contextDB.FontSizes.FirstOrDefaultAsync(x => x.Name == name);
        }

        public async Task<List<Theme>> GetThemes()
        {
            return await contextDB.Themes.ToListAsync();
        }

        public async Task<Theme> GetThemeByName(string name)
        {
            return await contextDB.Themes.FirstOrDefaultAsync(x => x.Name == name);
        }
    }
}
