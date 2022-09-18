using Common.DatabaseModels.Models.History;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Histories
{
    public class SnapshotFileContentRepository : Repository<SnapshotFileContent, Guid>
    {
        public SnapshotFileContentRepository(NootsDBContext contextDB): base(contextDB)
        {

        }

        public Task<List<Guid>> GetFileIdsThatExist(params Guid[] ids)
        {
            return entities.Where(x => ids.Contains(x.AppFileId)).Select(x => x.AppFileId).ToListAsync();
        }

    }
}
