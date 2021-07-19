using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.History;
using Domain.Commands.Notes;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using WriteContext.Repositories.Histories;

namespace BI.Services.History
{
    public class HistoryService
    {
        private HistoryCacheService historyCacheService;

        IServiceScopeFactory serviceScopeFactory;

        public HistoryService(HistoryCacheService historyCacheServicу, IServiceScopeFactory serviceScopeFactory)
        {
            this.historyCacheService = historyCacheServicу;
            this.serviceScopeFactory = serviceScopeFactory;
        }

        public void DoWork()
        {
            try
            {
                var histories = historyCacheService.GetCacheHistoriesForSnapshotingByTime(10);
                if (histories.Any())
                {
                    try
                    {
                        MakeCopy(histories).Wait();
                    }
                    catch(Exception e)
                    {
                        Console.WriteLine(e);
                    }
                    finally
                    {
                        historyCacheService.RemoveFromList(histories);
                    }
                }
            }catch(Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public async Task MakeCopy(List<CacheHistory> histories)
        {
            using var scope = serviceScopeFactory.CreateScope();
            var _mediator = scope.ServiceProvider.GetService<IMediator>();
            var noteHistoryRepository = scope.ServiceProvider.GetService<NoteSnapshotRepository>();
            var userNoteHistoryManyToManyRepository = scope.ServiceProvider.GetService<UserNoteHistoryManyToManyRepository>();
            foreach (var history in histories)
            {
                var command = new MakeNoteHistoryCommand(history.NoteId);
                var results = await _mediator.Send(command);

                var noteHistory = new NoteHistory() //  СКОМПЛИТЬ БД
                {
                    NoteId = history.NoteId,
                    SnapshotTime = DateTimeOffset.Now,
                    // TODO
                    // NoteVersionId = result.Id 
                };

                var dbNoteHistory = await noteHistoryRepository.Add(noteHistory);
                var userHistories = history.UsersThatEditIds.Select(userId => new UserNoteHistoryManyToMany()
                {
                    NoteHistoryId = dbNoteHistory.Entity.Id,
                    UserId = userId
                });

                await userNoteHistoryManyToManyRepository.AddRange(userHistories);
            }
        }

    }
}
