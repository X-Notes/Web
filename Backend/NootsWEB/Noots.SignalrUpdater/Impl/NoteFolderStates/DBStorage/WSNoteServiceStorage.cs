using Common.DatabaseModels.Models.WS;
using Noots.DatabaseContext.Repositories.WS;
using SignalrUpdater.Interfaces;

namespace SignalrUpdater.Impl.NoteFolderStates.DBStorage
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

        public Task<List<string>> GetConnectionsByIdAsync(Guid noteId)
        {
            return noteConnectionRepository.GetConnectionsById(noteId);
        }

        public Task<List<Guid>> GetUserIdsByNoteId(Guid noteId, Guid exceptUserId)
        {
            return noteConnectionRepository.GetUserIdsByNoteId(noteId, exceptUserId);
        }

        public Task<List<Guid>> GetUserIdsByNoteId(Guid noteId)
        {
            return noteConnectionRepository.GetUserIdsByNoteId(noteId);
        }

        public Task<int> UsersOnNoteAsync(Guid noteId, Guid exceptUserId)
        {
            return noteConnectionRepository.UsersOnNoteAsync(noteId, exceptUserId);
        }

        public async Task AddAsync(Guid noteId, UserIdentifierConnectionId userIdentity)
        {
            var isExist = await noteConnectionRepository.GetAnyAsync(x => x.NoteId == noteId && x.UserIdentifierConnectionIdId == userIdentity.Id);
            if (!isExist)
            {
                await noteConnectionRepository.AddAsync(NoteConnection.Init(userIdentity.Id, noteId, userIdentity.ConnectionId, userIdentity.UserId));
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
