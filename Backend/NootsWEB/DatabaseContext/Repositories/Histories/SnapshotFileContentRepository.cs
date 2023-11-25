using Common.DatabaseModels.Models.History;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.Histories
{
    public class SnapshotFileContentRepository : Repository<SnapshotFileContent, Guid>
    {
        public SnapshotFileContentRepository(ApiDbContext contextDB): base(contextDB)
        {

        }

        public Task<List<Guid>> GetFileIdsThatExist(params Guid[] ids)
        {
            return entities.Where(x => ids.Contains(x.AppFileId)).Select(x => x.AppFileId).ToListAsync();
        }

    }
}
