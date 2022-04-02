using System;
using System.Linq;
using System.Threading.Tasks;
using BI.Services.History;
using Common;
using Domain.Commands.Notes;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace BI.JobsHandlers
{
    public class ConfigForHistoryMaker
    {
        public int MakeSnapshotAfterNMinutes { set; get; } = 1;
    }

    public class HistoryJobHandler
    {
        private HistoryCacheServiceStorage historyCacheService;

        private readonly IServiceScopeFactory serviceScopeFactory;

        private readonly ConfigForHistoryMaker config;

        public HistoryJobHandler(
            HistoryCacheServiceStorage historyCacheServicу,
            IServiceScopeFactory serviceScopeFactory,
            ConfigForHistoryMaker config)
        {
            historyCacheService = historyCacheServicу;
            this.serviceScopeFactory = serviceScopeFactory;
            this.config = config;
        }

        public async Task MakeHistoryHandler()
        {    
            try
            {
                Console.WriteLine("Start make history");

                var earliestTimestamp = DateTimeProvider.Time.AddMinutes(-config.MakeSnapshotAfterNMinutes);
                var histories = historyCacheService.GetCacheHistoriesForSnapshotingByTime(earliestTimestamp);
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
                        historyCacheService.RemoveFromList(histories);
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
