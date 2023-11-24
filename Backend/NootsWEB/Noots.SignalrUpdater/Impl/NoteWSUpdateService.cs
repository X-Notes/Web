using Common.DTO.WebSockets;
using DatabaseContext.Repositories.Folders;
using DatabaseContext.Repositories.Notes;
using SignalrUpdater.Interfaces;

namespace SignalrUpdater.Impl
{
    public class NoteWSUpdateService
    {
        private readonly INoteServiceStorage WSNoteServiceStorage;
        private readonly IFolderServiceStorage WSFolderServiceStorage;

        private readonly AppSignalRService appSignalRService;
        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly NoteRepository noteRepository;

        public NoteWSUpdateService(
            INoteServiceStorage WSNoteServiceStorage,
            IFolderServiceStorage WSFolderServiceStorage,
            AppSignalRService appSignalRService,
            FoldersNotesRepository foldersNotesRepository,
            NoteRepository noteRepository)
        {
            this.WSNoteServiceStorage = WSNoteServiceStorage;
            this.WSFolderServiceStorage = WSFolderServiceStorage;
            this.appSignalRService = appSignalRService;
            this.foldersNotesRepository = foldersNotesRepository;
            this.noteRepository = noteRepository;
        }

        public async Task UpdateNotesWithConnections(IEnumerable<(UpdateNoteWS value, List<Guid> userIds)> updates, string exceptConnectionId)
        {
            foreach (var update in updates)
            {
                await UpdateNoteWithConnections(update.value, update.userIds, exceptConnectionId);
            }
        }

        public async Task UpdateNoteWithConnections(UpdateNoteWS update, List<Guid> userIds, string exceptConnectionId)
        {
            var connections = await GetConnectionsToUpdate(update.NoteId, userIds, exceptConnectionId);

            if (connections.Any())
            {
                await appSignalRService.UpdateNoteClients(update, connections);
            }
        }

        public async Task<List<string>> GetConnectionsToUpdate(Guid noteId, List<Guid> userIds, string exceptConnectionId)
        {
            var connections = await WSNoteServiceStorage.GetConnectionsByIdAsync(noteId);

            if (userIds != null && userIds.Any())
            {
                var additionalConnections = await appSignalRService.GetAuthorizedConnections(userIds); // private users on note, the can not be presented on full note at moment but anyway need to send them updates.
                connections.AddRange(additionalConnections);
            }

            var folderConnections = await GetFolderConnections(noteId);
            if (folderConnections.Any())
            {
                connections.AddRange(folderConnections);
            }

            connections = connections.Where(id => id != exceptConnectionId).Distinct().ToList();

            return connections;
        }

        public async Task<List<Guid>> GetNotesUserIds(Guid noteId)
        {
            var userIds = new List<Guid>();

            var currentUsersOnNote = await WSNoteServiceStorage.GetUserIdsByNoteId(noteId);
            userIds.AddRange(currentUsersOnNote);

            var note = await noteRepository.GetForCheckPermission(noteId);
            if (note != null)
            {
                userIds.Add(note.UserId);
                userIds.AddRange(note.UsersOnPrivateNotes.Select(q => q.UserId));
            }

            var folderNoteUserIds = await GetFolderUserIds(noteId);
            if (folderNoteUserIds.Any())
            {
                userIds.AddRange(folderNoteUserIds);
            }

            return userIds.Distinct().ToList();
        }

        private async Task<List<string>> GetFolderConnections(Guid noteId)
        {
            var ents = await foldersNotesRepository.GetWhereAsync(x => noteId == x.NoteId);
            var folderIds = ents.Select(x => x.FolderId).Distinct();

            if(folderIds.Any())
            {
                return await WSFolderServiceStorage.GetConnectionsByFolderIdsAsync(folderIds);
            }

            return new List<string>();;
        }

        private async Task<List<Guid>> GetFolderUserIds(Guid noteId)
        {
            var ents = await foldersNotesRepository.GetWhereAsync(x => noteId == x.NoteId);
            var folderIds = ents.Select(x => x.FolderId).Distinct().ToList();

            if (folderIds.Any())
            {
                return await WSFolderServiceStorage.GetUserIdsByFolderIds(folderIds);
            }

            return new List<Guid>(); ;
        }
    }
}
