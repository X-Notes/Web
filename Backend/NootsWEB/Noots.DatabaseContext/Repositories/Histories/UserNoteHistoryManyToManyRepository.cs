using Common.DatabaseModels.Models.History;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Histories
{
    public class UserNoteHistoryManyToManyRepository : Repository<UserNoteSnapshotManyToMany, Guid>
    {
        public UserNoteHistoryManyToManyRepository(NootsDBContext contextDB)
                : base(contextDB)
        {

        }
    }
}
