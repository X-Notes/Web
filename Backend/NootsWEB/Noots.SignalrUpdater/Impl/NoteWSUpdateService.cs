using Common.DTO.WebSockets;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.SignalrUpdater.Impl.NoteFolderStates.MemoryStorage;

namespace Noots.SignalrUpdater.Impl
{
    public class NoteWSUpdateService
    {
        private readonly WSMemoryNotesServiceStorage websocketsNotesService;
        private readonly AppSignalRService appSignalRService;
        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly WSMemoryFoldersServiceStorage websocketsFoldersService;

        public NoteWSUpdateService(
            WSMemoryNotesServiceStorage websocketsNotesService,
            WSMemoryFoldersServiceStorage websocketsFoldersService,
            AppSignalRService appSignalRService,
            FoldersNotesRepository foldersNotesRepository)
        {
            this.websocketsNotesService = websocketsNotesService;
            this.websocketsFoldersService = websocketsFoldersService;
            this.appSignalRService = appSignalRService;
            this.foldersNotesRepository = foldersNotesRepository;
        }

        public async Task UpdateNotes(IEnumerable<(UpdateNoteWS value, List<Guid> userIds)> updates, Guid exceptUserId)
        {
            foreach (var update in updates)
            {
                await UpdateNote(update.value, update.userIds, exceptUserId);
            }
        }

        public async Task UpdateNote(UpdateNoteWS update, List<Guid> userIds, Guid exceptUserId)
        {
            var connections = websocketsNotesService.GetConnectiondsById(update.NoteId, exceptUserId);

            if (userIds != null && userIds.Any())
            {
                var additionalConnections = await appSignalRService.GetAuthorizedConnections(userIds, exceptUserId);
                connections.AddRange(additionalConnections);
            }

            var folderConnections = await GetFolderConnections(update, exceptUserId);
            if (folderConnections.Any())
            {
                connections.AddRange(folderConnections);
            }

            await appSignalRService.UpdateNoteInManyUsers(update, connections.Distinct());
        }

        private async Task<List<string>> GetFolderConnections(UpdateNoteWS updates, Guid exceptUserId)
        {
            var ents = await foldersNotesRepository.GetWhereAsync(x => updates.NoteId == x.NoteId);
            var folderIds = ents.Select(x => x.FolderId).Distinct();
            return folderIds.SelectMany(id => websocketsFoldersService.GetConnectiondsById(id, exceptUserId)).ToList();
        }
    }
}
