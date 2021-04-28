using Common.DatabaseModels.models.History;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Histories
{
    public class NoteHistoryRepository : Repository<NoteHistory>
    {
        public NoteHistoryRepository(WriteContextDB contextDB)
        : base(contextDB)
        {

        }
    }
}
