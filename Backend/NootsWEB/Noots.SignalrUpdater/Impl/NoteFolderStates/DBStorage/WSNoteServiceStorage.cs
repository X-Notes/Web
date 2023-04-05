using Common.DatabaseModels.Models.WS;
using Noots.DatabaseContext.Repositories.WS;
using Noots.SignalrUpdater.Interfaces;

namespace Noots.SignalrUpdater.Impl.NoteFolderStates.DBStorage
{
    public class WSNoteServiceStorage : INoteServiceStorage
    {
        private readonly NoteConnectionRepository noteConnectionRepository;

        public WSNoteServiceStorage(NoteConnectionRepository noteConnectionRepository)
        {
            this.noteConnectionRepository = noteConnectionRepository;
        }

        public Task<bool> IsContainsConnectionId(Guid noteId, string connectionId)
        {
            return noteConnectionRepository.GetAnyAsync(x => x.NoteId == noteId && x.ConnectionId == connectionId);
        }

        public Task<List<UserIdentifierConnectionId>> GetEntitiesIdAsync(Guid noteId)
        {
            return noteConnectionRepository.GetUserConnectionsById(noteId);
        }

        public Task<List<string>> GetConnectionsByIdAsync(Guid noteId, Guid exceptUserId)
        {
            return noteConnectionRepository.GetConnectionsById(noteId, exceptUserId);
        }

        public async Task AddAsync(Guid noteId, UserIdentifierConnectionId userIdentity)
        {
            var isExist = await noteConnectionRepository.GetAnyAsync(x => x.NoteId == noteId && x.UserIdentifierConnectionIdId == userIdentity.Id);
            var userId = userIdentity.GetUserId();
            if(userId == null)
            {
                throw new Exception("user id cannot be NULL");
            }
            if (!isExist)
            {
                await noteConnectionRepository.AddAsync(NoteConnection.Init(userIdentity.Id, noteId, userIdentity.ConnectionId, userId.Value));
            }
        }

        public async Task RemoveAsync(Guid noteId, Guid identifierId)
        {
            var entity = await noteConnectionRepository.FirstOrDefaultAsync(x => x.NoteId == noteId && x.UserIdentifierConnectionIdId == identifierId);

            if(entity != null)
            {
                await noteConnectionRepository.RemoveAsync(entity);
            }
        }
    }
}
