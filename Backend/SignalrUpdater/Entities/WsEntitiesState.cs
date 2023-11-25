using System.Collections.Concurrent;
using Common.DatabaseModels.Models.WS;

namespace SignalrUpdater.Entities
{
    public class WsEntitiesState
    {
        public ConcurrentDictionary<string, UserIdentifierConnectionId> Users { get; set; } = new();

        public DateTimeOffset UpdateTime { set; get; }
    }
}
