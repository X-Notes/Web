using Common.DatabaseModels.Models.WS;
using Noots.DatabaseContext.Repositories.WS;
using Noots.SignalrUpdater.Interfaces;

namespace Noots.SignalrUpdater.Impl.NoteFolderStates.DBStorage
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

        public Task<List<UserIdentifierConnectionId>> GetEntitiesId(Guid folderId)
        {
            return folderConnectionRepository.GetUserConnectionsById(folderId);
        }

        public Task<List<string>> GetConnectionsByIdAsync(Guid noteId, Guid exceptUserId)
        {
            return folderConnectionRepository.GetConnectionsById(noteId, exceptUserId);
        }

        public async Task AddAsync(Guid folderId, UserIdentifierConnectionId userIdentity)
        {
            var isExist = await folderConnectionRepository.GetAnyAsync(x => x.FolderId == folderId && x.UserIdentifierConnectionIdId == userIdentity.Id);
            var userId = userIdentity.GetUserId();
            if (userId == null)
            {
                throw new Exception("user id cannot be NULL");
            }
            if (!isExist)
            {                
                await folderConnectionRepository.AddAsync(FolderConnection.Init(userIdentity.Id, folderId, userIdentity.ConnectionId, userId.Value));
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
