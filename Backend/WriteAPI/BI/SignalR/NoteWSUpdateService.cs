using Common.DTO.WebSockets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Users;

namespace BI.SignalR
{
    public class NoteWSUpdateService
    {
        private readonly WebsocketsNotesServiceStorage websocketsNotesService;
        private readonly AppSignalRService appSignalRService;
        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly WebsocketsFoldersServiceStorage websocketsFoldersService;

        public NoteWSUpdateService(
            WebsocketsNotesServiceStorage websocketsNotesService,
            WebsocketsFoldersServiceStorage websocketsFoldersService,
            AppSignalRService appSignalRService,
            FoldersNotesRepository foldersNotesRepository)
        {
            this.websocketsNotesService = websocketsNotesService;
            this.websocketsFoldersService = websocketsFoldersService;
            this.appSignalRService = appSignalRService;
            this.foldersNotesRepository = foldersNotesRepository;
        }

        public async Task UpdateNotes(IEnumerable<(UpdateNoteWS value, List<Guid> userIds)> updates)
        {
            foreach(var update in updates)
            {
                await UpdateNote(update.value, update.userIds);
            }
        }

        public async Task UpdateNote(UpdateNoteWS update, List<Guid> userIds)
        {
            var connections = websocketsNotesService.GetConnectiondsById(update.NoteId);

            if(userIds != null && userIds.Any())
            {
                var additionalConnections = await appSignalRService.GetAuthorizedConnections(userIds);
                connections.AddRange(additionalConnections);
            }

            await appSignalRService.UpdateNoteInManyUsers(update, connections.Distinct());
        }

        public async Task UpdateNotesInFolder(IEnumerable<UpdateNoteWS> updates)
        {
            var noteIds = updates.Select(x => x.NoteId).ToList();
            var ents = await foldersNotesRepository.GetWhereAsync(x => noteIds.Contains(x.NoteId));
            var foldersNotes = ents.ToLookup(x => x.FolderId);
            foreach(var folderNotes in foldersNotes)
            {
                var connections = websocketsFoldersService.GetConnectiondsById(folderNotes.Key).Distinct();
                var updatesWS = updates.Where(x => folderNotes.Any(q => q.NoteId == x.NoteId));
                if (connections.Any())
                {
                    foreach(var update in updatesWS)
                    {
                        await appSignalRService.UpdateNoteInManyUsers(update, connections);
                    }
                }
            }
        }
    }
}
