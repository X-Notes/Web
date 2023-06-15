using Common;
using MediatR;
using Noots.API.Workers.Models.Config;
using Noots.History.Commands;
using Noots.History.Impl;

namespace Noots.API.Workers.BI
{
    public class HistoryJobHandler
    {
        private HistoryCacheService historyCacheService;

        private readonly IServiceScopeFactory serviceScopeFactory;

        private readonly JobsTimerConfig jobsTimerConfig;

        private readonly ILogger<HistoryJobHandler> logger;

        public HistoryJobHandler(
            HistoryCacheService historyCacheServicу,
            IServiceScopeFactory serviceScopeFactory,
            JobsTimerConfig jobsTimerConfig,
            ILogger<HistoryJobHandler> logger)
        {
            historyCacheService = historyCacheServicу;
            this.serviceScopeFactory = serviceScopeFactory;
            this.jobsTimerConfig = jobsTimerConfig;
            this.logger = logger;
        }

        public async Task MakeHistoryHandler()
        {
            try
            {
                logger.LogInformation("Start make history");

                var earliestTimestamp = DateTimeProvider.Time.AddMinutes(-jobsTimerConfig.MakeSnapshotAfterNMinutes);
                var histories = await historyCacheService.GetCacheHistoriesForSnapshotingByTime(earliestTimestamp);
                if (histories.Any())
                {
                    try
                    {
                        using var scope = serviceScopeFactory.CreateScope();
                        var _mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
                        foreach (var history in histories)
                        {
                            var command = new MakeNoteHistoryCommand(history.NoteId, history.UsersThatEditIds);
                            var results = await _mediator.Send(command);
                        }
                    }
                    catch (Exception e)
                    {
                        logger.LogError(e.ToString());
                    }
                    finally
                    {
                        await historyCacheService.RemoveUpdateDates(histories);
                    }
                }

                logger.LogInformation("End make history");

            }
            catch (Exception e)
            {
                logger.LogError(e.ToString());
            }
        }

    }
}
