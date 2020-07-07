using Domain.Aggregates;
using Marten.Events;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Domain.Repository
{
    public interface IRepository<T>
    {
        Task<T> Find(Guid id);
        Task<IReadOnlyList<IEvent>> FetchStream(Guid id);
        Task<IEvent> LoadAsync(Guid id);
        Task Add(T aggregate);
        Task Update(T aggregate);
        Task<IReadOnlyList<T>> Query();
        Task Delete(T aggregate);
    }
}
