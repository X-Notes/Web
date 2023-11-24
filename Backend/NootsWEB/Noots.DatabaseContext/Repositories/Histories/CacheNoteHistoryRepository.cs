using Common.DatabaseModels.Models.History;
using DatabaseContext.GenericRepositories;

namespace DatabaseContext.Repositories.Histories
{
    public class CacheNoteHistoryRepository : Repository<CacheNoteHistory, Guid>
    {
        public CacheNoteHistoryRepository(NootsDBContext contextDB): base(contextDB)
        {
        }
    }
}
