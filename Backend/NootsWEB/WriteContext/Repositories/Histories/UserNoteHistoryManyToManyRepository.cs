using System;
using Common.DatabaseModels.Models.History;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Histories
{
    public class UserNoteHistoryManyToManyRepository : Repository<UserNoteSnapshotManyToMany, Guid>
    {
        public UserNoteHistoryManyToManyRepository(WriteContextDB contextDB)
                : base(contextDB)
        {

        }
    }
}
