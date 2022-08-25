﻿using Common;
using MediatR;
using Noots.DatabaseContext.Repositories.Files;
using Noots.Storage.Commands;
using NootsWorkersWEB.Models.Config;

namespace NootsWorkersWEB.BI
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

        public async Task DeleteUnLinkedFiles()
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