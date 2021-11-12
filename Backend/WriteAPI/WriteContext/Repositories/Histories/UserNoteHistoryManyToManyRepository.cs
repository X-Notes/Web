using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
