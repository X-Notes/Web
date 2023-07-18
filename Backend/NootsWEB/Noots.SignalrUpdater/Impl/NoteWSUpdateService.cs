using Common.DTO.WebSockets;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.SignalrUpdater.Interfaces;

namespace Noots.SignalrUpdater.Impl
{
    public class NoteWSUpdateService
    {
        private readonly INoteServiceStorage WSNoteServiceStorage;
        private readonly IFolderServiceStorage WSFolderServiceStorage;

        private readonly AppSignalRService appSignalRService;
        private readonly FoldersNotesRepository foldersNotesRepository;

        public NoteWSUpdateService(
            INoteServiceStorage WSNoteServiceStorage,
            IFolderServiceStorage WSFolderServiceStorage,
            AppSignalRService appSignalRService,
            FoldersNotesRepository foldersNotesRepository)
        {
            this.WSNoteServiceStorage = WSNoteServiceStorage;
            this.WSFolderServiceStorage = WSFolderServiceStorage;
            this.appSignalRService = appSignalRService;
            this.foldersNotesRepository = foldersNotesRepository;
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
            var connections = await WSNoteServiceStorage.GetConnectionsByIdAsync(update.NoteId); 

            if (userIds != null && userIds.Any())
            {
                var additionalConnections = await appSignalRService.GetAuthorizedConnections(userIds); // private users on note, the can not be presented on full note at moment but anyway need to send them updates.
                connections.AddRange(additionalConnections);
            }

            var folderConnections = await GetFolderConnections(update.NoteId);
            if (folderConnections.Any())
            {
                connections.AddRange(folderConnections);
            }

            connections = connections.Where(id => id != exceptConnectionId).Distinct().ToList();

            await appSignalRService.UpdateNoteClients(update, connections);
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
    }
}
