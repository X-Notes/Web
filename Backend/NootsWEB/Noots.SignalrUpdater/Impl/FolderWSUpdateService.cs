using Common.DTO.WebSockets;
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

        public async Task UpdateFolders(IEnumerable<(UpdateFolderWS value, List<Guid> ids)> updates, string exceptConnectionId)
        {
            foreach (var update in updates)
            {
                await UpdateFolder(update.value, update.ids, exceptConnectionId);
            }
        }

        public async Task UpdateFolder(UpdateFolderWS update, List<Guid> userIds, string exceptConnectionId)
        {
            var connections = await WSFolderServiceStorage.GetConnectionsByFolderIdAsync(update.FolderId);

            if (userIds != null && userIds.Any())
            {
                var additionalConnections = await appSignalRService.GetAuthorizedConnections(userIds);
                connections.AddRange(additionalConnections);
            }

            connections = connections.Where(id => id != exceptConnectionId).Distinct().ToList();

            await appSignalRService.UpdateFolderClients(update, connections);
        }
    }
}
