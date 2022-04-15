using Common.DatabaseModels.Models.History;
using System;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Histories
{
    public class CacheNoteHistoryRepository : Repository<CacheNoteHistory, Guid>
    {
        public CacheNoteHistoryRepository(WriteContextDB contextDB): base(contextDB)
        {
        }
    }
}
