using Common.DatabaseModels.Models.Users;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Users
{
    public class PersonalizationSettingRepository : Repository<PersonalizationSetting, Guid>
    {
        public PersonalizationSettingRepository(NootsDBContext contextDB)
                : base(contextDB)
        {
        }

    }
}
