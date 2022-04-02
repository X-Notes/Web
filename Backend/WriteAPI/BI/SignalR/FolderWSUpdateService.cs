
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
            var userIdsThatOnFullFolder = websocketsFoldersService.GetIdsByEntityId(update.FolderId);

            if (userIds != null && userIds.Any())
            {
                userIdsThatOnFullFolder.AddRange(userIds);
            }

            var emails = await userRepository.GetUsersEmail(userIdsThatOnFullFolder.Distinct()); // TODO MAYBE ADD CACHE
            await appSignalRService.UpdateFoldersInManyUsers(update, emails);
        }
    }
}
