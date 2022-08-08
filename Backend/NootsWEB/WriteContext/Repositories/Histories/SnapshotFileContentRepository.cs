using Common.DatabaseModels.Models.History;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Histories
{
    public class SnapshotFileContentRepository : Repository<SnapshotFileContent, Guid>
    {
        public SnapshotFileContentRepository(WriteContextDB contextDB): base(contextDB)
        {

        }

        public Task<List<Guid>> GetFileIdsThatExist(params Guid[] ids)
        {
            return entities.Where(x => ids.Contains(x.AppFileId)).Select(x => x.AppFileId).ToListAsync();
        }

    }
}
