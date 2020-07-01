using Domain.Aggregates;
using Marten;
using Marten.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Domain.Repository
{
    public class MartenRepository<T> : IRepository<T> where T: AggregateBase
    {
        private readonly IDocumentSession documentSession;

        public MartenRepository(IDocumentSession documentSession)
        {
            this.documentSession = documentSession;
        }

        public Task<T> Find(Guid id)
        {
            return documentSession.Events.AggregateStreamAsync<T>(id);
        }

        public Task<IReadOnlyList<IEvent>> FetchStream(Guid id)
        {
            return documentSession.Events.FetchStreamAsync(id);
        }
        public Task<IEvent> LoadAsync(Guid id)
        {
            return documentSession.Events.LoadAsync(id);
        }
        public Task<IReadOnlyList<T>> Query()
        {
            return documentSession.Query<T>().Where(x => x.Version == 2).ToListAsync();
        }
        public Task Add(T aggregate)
        {
            return Store(aggregate);
        }

        public Task Update(T aggregate)
        {
            return Store(aggregate);
        }

        public Task Delete(T aggregate)
        {
            return Store(aggregate);
        }

        private async Task Store(T aggregate)
        {
            var events = aggregate.PendingEvents.ToArray();
            documentSession.Events.Append(aggregate.Id, aggregate.Version, events);
            await documentSession.SaveChangesAsync();
            aggregate.ClearUncommittedEvents();
        }
    }
}
