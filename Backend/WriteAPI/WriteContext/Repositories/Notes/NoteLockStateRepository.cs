using Common.DatabaseModels.Models.Notes;
using System;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Notes
{
    public class NoteLockStateRepository : Repository<NoteLockState, Guid>
    {
        public NoteLockStateRepository(WriteContextDB contextDB)
        : base(contextDB)
        {

        }
    }
}
