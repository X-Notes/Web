using Common.DatabaseModels.Models.Files;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Files
{
    public class AppFileUploadInfoRepository : Repository<AppFileUploadInfo, Guid>
    {
        public AppFileUploadInfoRepository(WriteContextDB contextDB) : base(contextDB)
        {
        }

        public Task<List<AppFileUploadInfo>> GetFilesInfoThatNeedDelete(DateTimeOffset earliestTimestamp)
        {
            return entities.Include(x => x.AppFile).Where(x => x.UnLinkedDate.HasValue && x.UnLinkedDate.Value < earliestTimestamp).ToListAsync();
        }
    }
}
