using Common.DatabaseModels.Models.History;
using DatabaseContext.GenericRepositories;

namespace DatabaseContext.Repositories.Histories
{
    public class UserNoteHistoryManyToManyRepository : Repository<UserNoteSnapshotManyToMany, Guid>
    {
        public UserNoteHistoryManyToManyRepository(NootsDBContext contextDB)
                : base(contextDB)
        {

        }
    }
}
