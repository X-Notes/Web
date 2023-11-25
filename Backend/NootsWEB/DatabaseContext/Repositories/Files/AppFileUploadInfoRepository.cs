using Common.DatabaseModels.Models.Files;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.Files
{
    public class AppFileUploadInfoRepository : Repository<AppFileUploadInfo, Guid>
    {
        public AppFileUploadInfoRepository(ApiDbContext contextDB) : base(contextDB)
        {
        }

        public Task<List<AppFileUploadInfo>> GetFilesInfoThatNeedDelete(DateTimeOffset earliestTimestamp)
        {
            return entities.Include(x => x.AppFile).Where(x => x.UnLinkedDate.HasValue && x.UnLinkedDate.Value < earliestTimestamp).ToListAsync();
        }
    }
}
