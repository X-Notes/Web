using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Users;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Users
{
    public class PersonalizationSettingRepository : Repository<PersonalizationSetting, Guid>
    {
        public PersonalizationSettingRepository(WriteContextDB contextDB)
                : base(contextDB)
        {
        }

    }
}
