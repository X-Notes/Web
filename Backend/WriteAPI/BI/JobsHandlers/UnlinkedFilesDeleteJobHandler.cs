using Common;
using Domain.Commands.Files;
using MediatR;
using System;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.Repositories.Files;

namespace BI.JobsHandlers
{
    public class ConfigForFilesDeleter
    {
        public int NDays { set; get; } = 2;
        public int NMinutes { set; get; } = 2;
    }

    public class UnlinkedFilesDeleteJobHandler
    {
        private readonly ConfigForFilesDeleter config;

        private readonly AppFileUploadInfoRepository appFileUploadInfoRepository;

        private readonly IMediator _mediator;

        public UnlinkedFilesDeleteJobHandler(
            ConfigForFilesDeleter config, 
            AppFileUploadInfoRepository appFileUploadInfoRepository,
            IMediator _mediator)
        {
            this.config = config;
            this.appFileUploadInfoRepository = appFileUploadInfoRepository;
            this._mediator = _mediator;
        }

        public async Task DeleteUnLinkedFiles()
        {
            try
            {
                Console.WriteLine("Start files deleting");

                var earliestTimestamp = DateTimeProvider.Time.AddMinutes(-config.NMinutes);

                var infos = await appFileUploadInfoRepository.GetFilesInfoThatNeedDelete(earliestTimestamp);

                if (infos.Any())
                {
                    Console.WriteLine($"{infos.Count()} files will be deleted");

                    // TODO DELETE

                    var groups = infos.GroupBy(x => x.AppFile.UserId);

                    foreach(var group in groups)
                    {
                        var userId = group.Key;
                        var files = group.Select(x => x.AppFile).ToList();
                        await _mediator.Send(new RemoveFilesCommand(userId.ToString(), files));
                    }

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
