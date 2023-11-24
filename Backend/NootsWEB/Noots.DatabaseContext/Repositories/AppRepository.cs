using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Plan;
using Common.DatabaseModels.Models.Systems;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories
{
    public class AppRepository
    {
        private readonly NootsDBContext contextDB;
        public AppRepository(NootsDBContext contextDB)
        {
            this.contextDB = contextDB;
        }

        public Task<List<Language>> GetLanguages()
        {
            return contextDB.Languages.ToListAsync();
        }

        public Task<Language> GetLanguageByName(string name)
        {
            return contextDB.Languages.FirstOrDefaultAsync(x => x.Name == name);
        }

        public Task<List<FontSize>> GetFontSizes()
        {
            return contextDB.FontSizes.ToListAsync();
        }

        public Task<FontSize> GetFontSizeByName(string name)
        {
            return contextDB.FontSizes.FirstOrDefaultAsync(x => x.Name == name);
        }

        public Task<List<Theme>> GetThemes()
        {
            return contextDB.Themes.ToListAsync();
        }

        public Task<Theme> GetThemeByName(string name)
        {
            return contextDB.Themes.FirstOrDefaultAsync(x => x.Name == name);
        }

        public Task<List<BillingPlan>> GetBillingPlans()
        {
            return contextDB.BillingPlans.ToListAsync();
        }

        public Task<BillingPlan> GetBillingPlanByName(string name)
        {
            return contextDB.BillingPlans.FirstOrDefaultAsync(x => x.Name == name);
        }

        public Task<List<NoteType>> GetNoteTypes()
        {
            return contextDB.NotesTypes.ToListAsync();
        }

        public Task<NoteType> GetNoteTypeByName(string name)
        {
            return contextDB.NotesTypes.FirstOrDefaultAsync(x => x.Name == name);
        }

        public Task<List<FolderType>> GetFolderTypes()
        {
            return contextDB.FoldersTypes.ToListAsync();
        }

        public Task<FolderType> GetFolderTypeByName(string name)
        {
            return contextDB.FoldersTypes.FirstOrDefaultAsync(x => x.Name == name);
        }

        public Task<List<RefType>> GetRefTypes()
        {
            return contextDB.RefTypes.ToListAsync();
        }

        public Task<RefType> GetRefTypeByName(string name)
        {
            return contextDB.RefTypes.FirstOrDefaultAsync(x => x.Name == name);
        }

    }
}
