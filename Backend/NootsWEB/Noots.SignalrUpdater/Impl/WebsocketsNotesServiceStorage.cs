using Microsoft.Extensions.Logging;

namespace Noots.SignalrUpdater.Impl
{
    public class WebsocketsNotesServiceStorage : WebsocketsBaseEntities
    {
        public WebsocketsNotesServiceStorage(ILogger<WebsocketsNotesServiceStorage> logger) : base(logger)
        {

        }
    }
}
