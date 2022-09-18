using Common.DatabaseModels.Models.WS;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.WS
{
    public class UserIdentifierConnectionIdRepository : Repository<UserIdentifierConnectionId, Guid>
    {
        public UserIdentifierConnectionIdRepository(NootsDBContext contextDB) : base(contextDB)
        {
        }
    }
}
