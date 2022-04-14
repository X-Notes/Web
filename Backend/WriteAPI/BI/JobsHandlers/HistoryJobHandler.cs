using System;
using System.Linq;
using System.Threading.Tasks;
using BI.Services.History;
using Common;
using Common.Timers;
using Domain.Commands.Notes;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace BI.JobsHandlers
{
    public class HistoryJobHandler
    {
        private HistoryCacheService historyCacheService;
        private readonly IServiceScopeFactory serviceScopeFactory;
        private readonly TimersConfig timersConfig;

        public HistoryJobHandler(
            HistoryCacheService historyCacheServicу,
            IServiceScopeFactory serviceScopeFactory,
            TimersConfig timersConfig)
        {
            historyCacheService = historyCacheServicу;
            this.serviceScopeFactory = serviceScopeFactory;
            this.timersConfig = timersConfig;
        }

        public async Task MakeHistoryHandler()
        {    
            try
            {
                Console.WriteLine("Start make history");

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
                        Console.WriteLine(e);
                    }
                    finally
                    {
                        await historyCacheService.RemoveUpdateDates(histories);
                    }
                }

                Console.WriteLine("End make history");

            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

    }
}
