using Microsoft.Extensions.Logging;

namespace Noots.SignalrUpdater.Impl.NoteFolderStates.MemoryStorage
{
    public class WSMemoryNotesServiceStorage : WSMemoryBaseEntitiesStorage
    {
        public WSMemoryNotesServiceStorage(ILogger<WSMemoryNotesServiceStorage> logger) : base(logger)
        {

        }
    }
}
