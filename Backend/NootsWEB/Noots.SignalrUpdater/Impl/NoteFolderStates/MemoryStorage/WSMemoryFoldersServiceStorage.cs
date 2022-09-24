using Microsoft.Extensions.Logging;

namespace Noots.SignalrUpdater.Impl.NoteFolderStates.MemoryStorage
{
    public class WSMemoryFoldersServiceStorage : WSMemoryBaseEntitiesStorage
    {
        public WSMemoryFoldersServiceStorage(ILogger<WSMemoryFoldersServiceStorage> logger) : base(logger)
        {

        }
    }
}
