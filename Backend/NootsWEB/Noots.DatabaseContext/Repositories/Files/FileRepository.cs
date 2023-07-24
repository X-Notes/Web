using Common.DatabaseModels.Models.Files;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Files
{
    public class FileRepository : Repository<AppFile, Guid>
    {
        public FileRepository(NootsDBContext contextDB)
            : base(contextDB)
        {
        }


        public Task<long> GetTotalUserMemory(Guid userId)
        {
            return  entities.Include(x => x.AppFileUploadInfo).Where(x => x.UserId == userId && x.AppFileUploadInfo.LinkedDate.HasValue).SumAsync(x => x.Size);
        }

        public Task<AppFile> GetFileWithAppFileUploadInfo(Guid fileId)
        {
            return entities.Include(x => x.AppFileUploadInfo).FirstOrDefaultAsync(x => x.Id == fileId);
        }

        public Task<List<AppFile>> GetFilesIncludeAllByLostCheckedDateAsync(int take, DateTimeOffset earliestTimestamp)
        {
            return entities
                .Include(x => x.Background)
                .Include(x => x.UserProfilePhoto)
                .Include(x => x.CollectionNoteAppFiles)
                .Include(x => x.SnapshotFileContents)
                .Where(x => x.LostCheckedAt < earliestTimestamp)
                .Take(take)
                .AsSplitQuery()
                .ToListAsync();
        }
    }
}
