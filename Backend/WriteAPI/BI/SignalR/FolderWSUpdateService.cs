﻿
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

        public FolderWSUpdateService(
            WebsocketsFoldersServiceStorage websocketsFoldersService, 
            AppSignalRService appSignalRService)
        {
            this.websocketsFoldersService = websocketsFoldersService;
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
            var connections = websocketsFoldersService.GetConnectiondsById(update.FolderId, exceptUserId);

            if (userIds != null && userIds.Any())
            {
                var additionalConnections = await appSignalRService.GetAuthorizedConnections(userIds, exceptUserId);
                connections.AddRange(additionalConnections);
            }

            await appSignalRService.UpdateFolderInManyUsers(update, connections.Distinct());
        }
    }
}
