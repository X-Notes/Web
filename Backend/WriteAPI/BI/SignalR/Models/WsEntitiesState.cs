using Common.DatabaseModels.Models.WS;
using System;
using System.Collections.Concurrent;

namespace BI.SignalR.Models
{
    public class WsEntitiesState
    {
        public ConcurrentDictionary<string, UserIdentifierConnectionId> Users { get; set; } = new();

        public DateTimeOffset UpdateTime { set; get; }
    }
}
