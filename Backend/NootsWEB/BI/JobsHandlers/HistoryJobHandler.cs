using System;
using System.Linq;
using System.Threading.Tasks;
using BI.Services.History;
using Common;
using Common.Timers;
using Domain.Commands.Notes;
using Google.Apis.Logging;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace BI.JobsHandlers
{
    public class HistoryJobHandler
    {
        private HistoryCacheService historyCacheService;
        private readonly IServiceScopeFactory serviceScopeFactory;
        private readonly TimersConfig timersConfig;
        private readonly ILogger<HistoryJobHandler> logger;

        public HistoryJobHandler(
            HistoryCacheService historyCacheServicу,
            IServiceScopeFactory serviceScopeFactory,
            TimersConfig timersConfig,
            ILogger<HistoryJobHandler> logger)
        {
            historyCacheService = historyCacheServicу;
            this.serviceScopeFactory = serviceScopeFactory;
            this.timersConfig = timersConfig;
            this.logger = logger;
        }

        public async Task MakeHistoryHandler()
        {    
            try
            {
                logger.LogInformation("Start make history");

                var earliestTimestamp = DateTimeProvider.Time.AddMinutes(-timersConfig.MakeSnapshotAfterNMinutes);
                var histories = await historyCacheService.GetCacheHistoriesForSnapshotingByTime(earliestTimestamp);
                if (histories.Any())
                {
                    try
                    {
                        using var scope = serviceScopeFactory.CreateScope();
                        var _mediator = scope.ServiceProvider.GetService<IMediator>();
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
