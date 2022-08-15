using Microsoft.Extensions.Logging;

namespace Noots.SignalrUpdater.Impl
{
    public class WebsocketsFoldersServiceStorage : WebsocketsBaseEntities
    {
        public WebsocketsFoldersServiceStorage(ILogger<WebsocketsFoldersServiceStorage> logger) : base(logger)
        {

        }
    }
}
