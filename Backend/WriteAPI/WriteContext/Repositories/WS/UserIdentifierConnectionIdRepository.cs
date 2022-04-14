using Common.DatabaseModels.Models.WS;
using System;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.WS
{
    public class UserIdentifierConnectionIdRepository : Repository<UserIdentifierConnectionId, Guid>
    {
        public UserIdentifierConnectionIdRepository(WriteContextDB contextDB) : base(contextDB)
        {
        }
    }
}
