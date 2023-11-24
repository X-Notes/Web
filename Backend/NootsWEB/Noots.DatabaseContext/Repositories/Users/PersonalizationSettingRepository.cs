using Common.DatabaseModels.Models.Users;
using DatabaseContext.GenericRepositories;

namespace DatabaseContext.Repositories.Users
{
    public class PersonalizationSettingRepository : Repository<PersonalizationSetting, Guid>
    {
        public PersonalizationSettingRepository(NootsDBContext contextDB)
                : base(contextDB)
        {
        }

    }
}
