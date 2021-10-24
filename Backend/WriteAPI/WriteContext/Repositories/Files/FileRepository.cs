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
            return await entities.Where(x => x.UserId == userId).SumAsync(x => x.Size);
        }

    }
}
