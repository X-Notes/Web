using Common;
using Common.Timers;
using Domain.Commands.Files;
using MediatR;
using System;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.Repositories.Files;

namespace BI.JobsHandlers
{

    public class UnlinkedFilesDeleteJobHandler
    {
        private readonly AppFileUploadInfoRepository appFileUploadInfoRepository;

        private readonly IMediator _mediator;

        private readonly HostedTimersConfig hostedTimersConfig;

        public UnlinkedFilesDeleteJobHandler(
            AppFileUploadInfoRepository appFileUploadInfoRepository,
            IMediator _mediator,
            HostedTimersConfig hostedTimersConfig)
        {
            this.hostedTimersConfig = hostedTimersConfig;
            this.appFileUploadInfoRepository = appFileUploadInfoRepository;
            this._mediator = _mediator;
            this.hostedTimersConfig = hostedTimersConfig;
        }

        public async Task DeleteUnLinkedFiles()
        {
            try
            {
                var earliestTimestamp = DateTimeProvider.Time.AddMinutes(-hostedTimersConfig.DeleteUnlinkedFilesAfterMinutes);

                var infos = await appFileUploadInfoRepository.GetFilesInfoThatNeedDelete(earliestTimestamp);

                if (infos.Any())
                {
                    Console.WriteLine($"{infos.Count()} files will be deleted");

                    var groups = infos.GroupBy(x => x.AppFile.UserId);
                    foreach(var group in groups)
                    {
                        var userId = group.Key;
                        var files = group.Select(x => x.AppFile).ToList();
                        await _mediator.Send(new RemoveFilesCommand(userId.ToString(), files));
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }
    }
}
