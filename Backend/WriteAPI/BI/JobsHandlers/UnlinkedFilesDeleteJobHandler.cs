using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.Labels;

namespace BI.JobsHandlers
{
    public class ConfigForFilesDeleter
    {
        public int NDays { set; get; } = 2;
    }

    public class UnlinkedFilesDeleteJobHandler
    {
        private readonly ConfigForFilesDeleter config;

        private readonly AppFileUploadInfoRepository appFileUploadInfoRepository;

        public UnlinkedFilesDeleteJobHandler(ConfigForFilesDeleter config, AppFileUploadInfoRepository appFileUploadInfoRepository)
        {
            this.config = config;
            this.appFileUploadInfoRepository = appFileUploadInfoRepository;
        }

        public async Task DeleteUnLinkedFiles()
        {
            try
            {
                Console.WriteLine("Start files deleting");

                var earliestTimestamp = DateTimeOffset.UtcNow.AddDays(-config.NDays);

                var infos = await appFileUploadInfoRepository.GetFilesInfoThatNeedDelete(earliestTimestamp);

                if (infos.Any())
                {
                    Console.WriteLine($"{infos.Count()} files will be deleted");

                   // TODO DELETE
                   //await labelRepostory.RemoveRangeAsync(labels);
                    Console.WriteLine("files were deleted");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }
    }
}
