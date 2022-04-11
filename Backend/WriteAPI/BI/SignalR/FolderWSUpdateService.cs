
using Common.DTO.WebSockets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.Repositories.Users;

namespace BI.SignalR
{
    public class FolderWSUpdateService
    {
        private readonly WebsocketsFoldersServiceStorage websocketsFoldersService;
        private readonly AppSignalRService appSignalRService;
        private readonly UserRepository userRepository;

        public FolderWSUpdateService(
            WebsocketsFoldersServiceStorage websocketsFoldersService, 
            AppSignalRService appSignalRService,
            UserRepository userRepository)
        {
            this.websocketsFoldersService = websocketsFoldersService;
            this.appSignalRService = appSignalRService;
            this.userRepository = userRepository;
        }

        public async Task UpdateFolders(IEnumerable<(UpdateFolderWS value, List<Guid> ids)> updates)
        {
            foreach (var update in updates)
            {
                await UpdateFolder(update.value, update.ids);
            }
        }

        public async Task UpdateFolder(UpdateFolderWS update, List<Guid> userIds)
        {
            var connections = websocketsFoldersService.GetConnectiondsById(update.FolderId);

            if (userIds != null && userIds.Any())
            {
                var additionalConnections = appSignalRService.GetConnections(userIds);
                connections.AddRange(additionalConnections);
            }

            await appSignalRService.UpdateFoldersInManyUsers(update, connections.Distinct());
        }
    }
}
