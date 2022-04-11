using Common.DTO.WebSockets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.Repositories.Users;

namespace BI.SignalR
{
    public class NoteWSUpdateService
    {
        private readonly WebsocketsNotesServiceStorage websocketsNotesService;
        private readonly AppSignalRService appSignalRService;
        private readonly UserRepository userRepository;

        public NoteWSUpdateService(
            WebsocketsNotesServiceStorage websocketsNotesService, 
            AppSignalRService appSignalRService,
            UserRepository userRepository)
        {
            this.websocketsNotesService = websocketsNotesService;
            this.appSignalRService = appSignalRService;
            this.userRepository = userRepository;
        }

        public async Task UpdateNotes(IEnumerable<(UpdateNoteWS value, List<Guid> ids)> updates)
        {
            foreach(var update in updates)
            {
                await UpdateNote(update.value, update.ids);
            }
        }

        public async Task UpdateNote(UpdateNoteWS update, List<Guid> userIds)
        {
            var connections = websocketsNotesService.GetConnectiondsById(update.NoteId);

            if(userIds != null && userIds.Any())
            {
                var additionalConnections = appSignalRService.GetConnections(userIds);
                connections.AddRange(additionalConnections);
            }

            await appSignalRService.UpdateNotesInManyUsers(update, connections.Distinct());
        }
    }
}
