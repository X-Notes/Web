using Common.DatabaseModels.Models.WS;
using System.Collections.Concurrent;

namespace Noots.SignalrUpdater.Models
{
    public class WsEntitiesState
    {
        public ConcurrentDictionary<string, UserIdentifierConnectionId> Users { get; set; } = new();

        public DateTimeOffset UpdateTime { set; get; }
    }
}
