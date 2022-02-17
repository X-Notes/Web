using System;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Files;
using WriteContext.GenericRepositories;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace WriteContext.Repositories.Files
{
    public class FileRepository : Repository<AppFile, Guid>
    {
        public FileRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }


        public async Task<long> GetTotalUserMemory(Guid userId)
        {
            return await entities.Include(x => x.AppFileUploadInfo).Where(x => x.UserId == userId && x.AppFileUploadInfo.StatusId == AppFileUploadStatusEnum.Linked).SumAsync(x => x.Size);
        }

        public Task<AppFile> GetFileWithAppFileUploadInfo(Guid fileId)
        {
            return entities.Include(x => x.AppFileUploadInfo).FirstOrDefaultAsync(x => x.Id == fileId);
        }
    }
}
