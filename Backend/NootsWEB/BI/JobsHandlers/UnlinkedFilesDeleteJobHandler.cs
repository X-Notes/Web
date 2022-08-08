using Common;
using Common.Timers;
using Domain.Commands.Files;
using MediatR;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger<UnlinkedFilesDeleteJobHandler> logger;

        public UnlinkedFilesDeleteJobHandler(
            AppFileUploadInfoRepository appFileUploadInfoRepository,
            IMediator _mediator,
            HostedTimersConfig hostedTimersConfig,
            ILogger<UnlinkedFilesDeleteJobHandler> logger)
        {
            this.hostedTimersConfig = hostedTimersConfig;
            this.logger = logger;
            this.appFileUploadInfoRepository = appFileUploadInfoRepository;
            this._mediator = _mediator;
            this.hostedTimersConfig = hostedTimersConfig;
        }

        public async Task DeleteUnLinkedFiles()
        {
            logger.LogInformation("Start DeleteUnLinkedFiles");
            try
            {
                var earliestTimestamp = DateTimeProvider.Time.AddMinutes(-hostedTimersConfig.DeleteUnlinkedFilesAfterMinutes);

                var infos = await appFileUploadInfoRepository.GetFilesInfoThatNeedDelete(earliestTimestamp);

                if (infos.Any())
                {
                    logger.LogInformation($"{infos.Count()} files will be deleted");

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
                logger.LogError(ex.ToString());
            }
        }
    }
}
