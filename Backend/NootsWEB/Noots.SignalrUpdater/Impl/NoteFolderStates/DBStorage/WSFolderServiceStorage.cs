using Common.DatabaseModels.Models.WS;
using Noots.DatabaseContext.Repositories.WS;
using SignalrUpdater.Interfaces;

namespace SignalrUpdater.Impl.NoteFolderStates.DBStorage
{
    public class WSFolderServiceStorage : IFolderServiceStorage
    {
        private readonly FolderConnectionRepository folderConnectionRepository;

        public WSFolderServiceStorage(FolderConnectionRepository folderConnectionRepository)
        {
            this.folderConnectionRepository = folderConnectionRepository;
        }

        public Task<bool> IsContainsConnectionId(Guid folderId, string connectionId)
        {
            return folderConnectionRepository.GetAnyAsync(x => x.FolderId == folderId && x.ConnectionId == connectionId);
        }

        public Task<int> UsersOnFolderAsync(Guid folderId, Guid exceptUserId)
        {
            return folderConnectionRepository.UsersOnFolderAsync(folderId, exceptUserId);
        }

        public Task<List<UserIdentifierConnectionId>> GetEntitiesId(Guid folderId)
        {
            return folderConnectionRepository.GetUserConnectionsById(folderId);
        }

        public Task<List<string>> GetConnectionsByFolderIdAsync(Guid folderId, Guid exceptUserId)
        {
            return folderConnectionRepository.GetConnectionsById(folderId, exceptUserId);
        }

        public Task<List<string>> GetConnectionsByFolderIdAsync(Guid folderId)
        {
            return folderConnectionRepository.GetConnectionsById(folderId);
        }

        public Task<List<string>> GetConnectionsByFolderIdsAsync(IEnumerable<Guid> folderIds)
        {
            return folderConnectionRepository.GetConnectionsByIds(folderIds);
        }

        public Task<List<Guid>> GetUserIdsByFolderId(Guid folderId, Guid exceptUserId)
        {
            return folderConnectionRepository.GetUserIdsByFolderId(folderId, exceptUserId);
        }

        public Task<List<Guid>> GetUserIdsByFolderId(Guid folderId)
        {
            return folderConnectionRepository.GetUserIdsByFolderId(folderId);
        }

        public Task<List<Guid>> GetUserIdsByFolderIds(List<Guid> folderIds)
        {
            return folderConnectionRepository.GetUserIdsByFolderIds(folderIds);
        }

        public async Task AddAsync(Guid folderId, UserIdentifierConnectionId userIdentity)
        {
            var isExist = await folderConnectionRepository.GetAnyAsync(x => x.FolderId == folderId && x.UserIdentifierConnectionIdId == userIdentity.Id);
            if (!isExist)
            {                
                await folderConnectionRepository.AddAsync(FolderConnection.Init(userIdentity.Id, folderId, userIdentity.ConnectionId, userIdentity.UserId));
            }
        }

        public async Task RemoveAsync(Guid folderId, Guid userIdentifier)
        {
            var entity = await folderConnectionRepository.FirstOrDefaultAsync(x => x.FolderId == folderId && x.UserIdentifierConnectionIdId == userIdentifier);

            if (entity != null)
            {
                await folderConnectionRepository.RemoveAsync(entity);
            }
        }
    }
}
