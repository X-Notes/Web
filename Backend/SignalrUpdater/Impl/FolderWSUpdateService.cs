using Common.DTO.WebSockets;
using DatabaseContext.Repositories.Folders;
using SignalrUpdater.Interfaces;

namespace SignalrUpdater.Impl
{
    public class FolderWSUpdateService
    {
        private readonly IFolderServiceStorage WSFolderServiceStorage;
        private readonly AppSignalRService appSignalRService;
        private readonly FolderRepository folderRepository;
        private readonly UsersOnPrivateFoldersRepository usersOnPrivateFolders;

        public FolderWSUpdateService(
            IFolderServiceStorage WSFolderServiceStorage,
            AppSignalRService appSignalRService,
            FolderRepository folderRepository,
            UsersOnPrivateFoldersRepository usersOnPrivateFolders)
        {
            this.WSFolderServiceStorage = WSFolderServiceStorage;
            this.appSignalRService = appSignalRService;
            this.folderRepository = folderRepository;
            this.usersOnPrivateFolders = usersOnPrivateFolders;
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
            var connections = await GetConnectionsToUpdate(update.FolderId, userIds, exceptConnectionId);

            if(connections.Count > 0)
            {
                await appSignalRService.UpdateFolderClients(update, connections);
            }
        }

        public async Task<List<string>> GetConnectionsToUpdate(Guid folderId, List<Guid> userIds, string exceptConnectionId)
        {
            var connections = await WSFolderServiceStorage.GetConnectionsByFolderIdAsync(folderId);

            if (userIds != null && userIds.Any())
            {
                var additionalConnections = await appSignalRService.GetAuthorizedConnections(userIds);
                connections.AddRange(additionalConnections);
            }

            connections = connections.Where(id => id != exceptConnectionId).Distinct().ToList();

            return connections;
        }

        public async Task<List<Guid>> GetFoldersUserIds(Guid folderId)
        {
            var userIds = new List<Guid>();

            var currentUsersOnFolder = await WSFolderServiceStorage.GetUserIdsByFolderId(folderId);
            userIds.AddRange(currentUsersOnFolder);

            var folder = await folderRepository.FirstOrDefaultAsync(x => x.Id == folderId);
            if (folder != null)
            {
                var folderUserIds = await usersOnPrivateFolders.GetFolderUserIdsAsync(folderId);
                userIds.Add(folder.UserId);
                userIds.AddRange(folderUserIds);
            }

            return userIds.Distinct().ToList();
        }
    }
}
