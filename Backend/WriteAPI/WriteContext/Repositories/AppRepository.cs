using Common.DatabaseModels.models.Systems;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
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

        public async Task<List<NoteType>> GetNoteTypes()
        {
            return await contextDB.NotesTypes.ToListAsync();
        }

        public async Task<NoteType> GetNoteTypeByName(string name)
        {
            return await contextDB.NotesTypes.FirstOrDefaultAsync(x => x.Name == name);
        }

        public async Task<List<FolderType>> GetFolderTypes()
        {
            return await contextDB.FoldersTypes.ToListAsync();
        }

        public async Task<FolderType> GetFolderTypeByName(string name)
        {
            return await contextDB.FoldersTypes.FirstOrDefaultAsync(x => x.Name == name);
        }

        public async Task<List<RefType>> GetRefTypes()
        {
            return await contextDB.RefTypes.ToListAsync();
        }
        public async Task<RefType> GetRefTypeByName(string name)
        {
            return await contextDB.RefTypes.FirstOrDefaultAsync(x => x.Name == name);
        }

    }
}
