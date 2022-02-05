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
        private readonly WebsocketsNotesService websocketsNotesService;
        private readonly AppSignalRService appSignalRService;
        private readonly UserRepository userRepository;

        public NoteWSUpdateService(
            WebsocketsNotesService websocketsNotesService, 
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
            var userIdsThatOnFullNote = websocketsNotesService.GetIdsByEntityId(update.NoteId);

            if(userIds != null && userIds.Any())
            {
                userIdsThatOnFullNote.AddRange(userIds);
            }

            var emails = await userRepository.GetUsersEmail(userIdsThatOnFullNote.Distinct()); // TODO MAYBE ADD CACHE
            await appSignalRService.UpdateNotesInManyUsers(update, emails);
        }
    }
}
