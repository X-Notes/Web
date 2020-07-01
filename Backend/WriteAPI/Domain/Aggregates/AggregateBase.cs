using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Aggregates
{
    public abstract class AggregateBase
    {
        public Guid Id { get; protected set; }
        public Queue<object> PendingEvents { get; private set; }

        public int Version { get; protected set; } = 1;

        public void ClearUncommittedEvents()
        {
            PendingEvents.Clear();
        }

        protected AggregateBase()
        {
            PendingEvents = new Queue<object>();
        }

        protected void Append(object @event)
        {
            PendingEvents.Enqueue(@event);
        }
    }
}
