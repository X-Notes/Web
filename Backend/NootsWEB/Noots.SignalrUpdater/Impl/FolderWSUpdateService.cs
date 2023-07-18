using Common.DTO.WebSockets;
using Noots.SignalrUpdater.Impl.NoteFolderStates.DBStorage;
using Noots.SignalrUpdater.Interfaces;

namespace Noots.SignalrUpdater.Impl
{
    public class FolderWSUpdateService
    {
        private readonly IFolderServiceStorage WSFolderServiceStorage;
        private readonly AppSignalRService appSignalRService;

        public FolderWSUpdateService(
            IFolderServiceStorage WSFolderServiceStorage,
            AppSignalRService appSignalRService)
        {
            this.WSFolderServiceStorage = WSFolderServiceStorage;
            this.appSignalRService = appSignalRService;
        }

        public async Task UpdateFolders(IEnumerable<(UpdateFolderWS value, List<Guid> ids)> updates, Guid exceptUserId)
        {
            foreach (var update in updates)
            {
                await UpdateFolder(update.value, update.ids, exceptUserId);
            }
        }

        public async Task UpdateFolder(UpdateFolderWS update, List<Guid> userIds, Guid exceptUserId)
        {
            var connections = await WSFolderServiceStorage.GetConnectionsByFolderIdAsync(update.FolderId, exceptUserId);

            if (userIds != null && userIds.Any())
            {
                var additionalConnections = await appSignalRService.GetAuthorizedConnections(userIds, exceptUserId);
                connections.AddRange(additionalConnections);
            }

            await appSignalRService.UpdateFolderClients(update, connections.Distinct());
        }
    }
}
