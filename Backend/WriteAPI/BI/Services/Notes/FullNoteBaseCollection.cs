using Common.DatabaseModels.Models.Files;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.Repositories.Files;

namespace BI.Services.Notes
{
    public class FullNoteBaseCollection
    {
        protected readonly AppFileUploadInfoRepository appFileUploadInfoRepository;

        protected readonly FileRepository fileRepository;

        public FullNoteBaseCollection(
            AppFileUploadInfoRepository appFileUploadInfoRepository,
            FileRepository fileRepository)
        {
            this.appFileUploadInfoRepository = appFileUploadInfoRepository;
            this.fileRepository = fileRepository;
        }

        protected async Task MarkAsUnlinked(params Guid[] ids)
        {
            var infos = await appFileUploadInfoRepository.GetWhereAsync(x => ids.Contains(x.AppFileId));
            infos.ForEach(x => x.SetUnLinked());
            await appFileUploadInfoRepository.UpdateRangeAsync(infos);
        }

        protected async Task MarkAsLinked(List<AppFile> files)
        {
            var flag = files.Any(x => x.AppFileUploadInfo == null);

            if (flag)
            {
                throw new Exception("AppFileUploadInfo is null");
            }

            files.ForEach(x => x.AppFileUploadInfo.SetLinked());
            await fileRepository.UpdateRangeAsync(files);
        }

        protected async Task MarkAsLinked(params Guid[] ids)
        {
            var infos = await appFileUploadInfoRepository.GetWhereAsync(x => ids.Contains(x.AppFileId));
            infos.ForEach(x => x.SetLinked());
            await appFileUploadInfoRepository.UpdateRangeAsync(infos);
        }
    }
}
