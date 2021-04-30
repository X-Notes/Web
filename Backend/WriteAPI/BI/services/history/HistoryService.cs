using Common.DatabaseModels.models.History;
using Domain.Commands.notes;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.Repositories.Histories;

namespace BI.services.history
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
            var histories = historyCacheService.GetCacheHistoriesForSnapshotingByTime(10);
            MakeCopy(histories).Wait();
            historyCacheService.RemoveFromList(histories);
        }

        public async Task MakeCopy(List<CacheHistory> histories)
        {
            using var scope = serviceScopeFactory.CreateScope();
            var _mediator = scope.ServiceProvider.GetService<IMediator>();
            var noteHistoryRepository = scope.ServiceProvider.GetService<NoteHistoryRepository>();
            var userNoteHistoryManyToManyRepository = scope.ServiceProvider.GetService<UserNoteHistoryManyToManyRepository>();
            foreach (var history in histories)
            {
                var command = new CopyNoteCommand().GetIsHistory(history.AuthorNoteEmail, new List<Guid> { history.NoteId });
                var results = await _mediator.Send(command);
                var result = results.First();
                if (result != null)
                {
                    var noteHistory = new NoteHistory()
                    {
                        NoteId = history.NoteId,
                        SnapshotTime = DateTimeOffset.Now,
                    };
                    var dbNoteHistory = await noteHistoryRepository.Add(noteHistory);
                    var userHistories = history.UsersThatEditIds.Select(userId => new UserNoteHistoryManyToMany() { 
                        NoteHistoryId = dbNoteHistory.Entity.Id,
                        UserId = userId
                    });
                    await userNoteHistoryManyToManyRepository.AddRange(userHistories);
                }
            }
        }

    }
}
