using Common.DatabaseModels.Models.History;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Histories
{
    public class CacheNoteHistoryRepository : Repository<CacheNoteHistory, Guid>
    {
        public CacheNoteHistoryRepository(NootsDBContext contextDB): base(contextDB)
        {
        }
    }
}
