using Common.DatabaseModels.Models.Files;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Files
{
    public class AppFileUploadInfoRepository : Repository<AppFileUploadInfo, Guid>
    {
        public AppFileUploadInfoRepository(NootsDBContext contextDB) : base(contextDB)
        {
        }

        public Task<List<AppFileUploadInfo>> GetFilesInfoThatNeedDelete(DateTimeOffset earliestTimestamp)
        {
            return entities.Include(x => x.AppFile).Where(x => x.UnLinkedDate.HasValue && x.UnLinkedDate.Value < earliestTimestamp).ToListAsync();
        }
    }
}
