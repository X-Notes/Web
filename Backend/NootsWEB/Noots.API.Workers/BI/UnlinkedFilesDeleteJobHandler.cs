using API.Worker.Models.Config;
using Common;
using DatabaseContext.Repositories.Files;
using MediatR;
using Storage.Commands;

namespace API.Worker.BI
{

    public class UnlinkedFilesDeleteJobHandler
    {
        private readonly AppFileUploadInfoRepository appFileUploadInfoRepository;

        private readonly IMediator _mediator;

        private readonly JobsTimerConfig jobsTimerConfig;

        private readonly ILogger<UnlinkedFilesDeleteJobHandler> logger;

        public UnlinkedFilesDeleteJobHandler(
            AppFileUploadInfoRepository appFileUploadInfoRepository,
            IMediator _mediator,
            JobsTimerConfig jobsTimerConfig,
            ILogger<UnlinkedFilesDeleteJobHandler> logger)
        {
            this._mediator = _mediator;
            this.jobsTimerConfig = jobsTimerConfig;
            this.logger = logger;
            this.appFileUploadInfoRepository = appFileUploadInfoRepository;
        }

        public async Task HandleAsync()
        {
            await DeleteUnLinkedFiles();
        }

        private async Task DeleteUnLinkedFiles()
        {
            logger.LogInformation("Start DeleteUnLinkedFiles");

            try
            {
                var earliestTimestamp = DateTimeProvider.Time.AddMinutes(-jobsTimerConfig.DeleteUnlinkedFilesAfterMinutes);

                var infos = await appFileUploadInfoRepository.GetFilesInfoThatNeedDelete(earliestTimestamp);

                if (infos.Any())
                {
                    logger.LogInformation($"{infos.Count()} files will be deleted");

                    var groups = infos.GroupBy(x => x.AppFile.UserId);
                    foreach (var group in groups)
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
