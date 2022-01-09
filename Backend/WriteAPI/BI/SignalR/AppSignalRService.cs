using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.Notes;
using Common.DTO.WebSockets;
using Microsoft.AspNetCore.SignalR;

namespace BI.SignalR
{
    public class AppSignalRService
    {
        public IHubContext<AppSignalRHub> signalRContext;
        public AppSignalRService(IHubContext<AppSignalRHub> context)
        {
            this.signalRContext = context;
        }

        public async Task SendNewNotification(string receiverEmail, bool flag)
        {         
            await signalRContext.Clients.User(receiverEmail).SendAsync("newNotification", flag);
        }

        public async Task UpdateNotesInManyUsers(IEnumerable<UpdateNoteWS> updates, IEnumerable<string> emails)
        {
            var list = new ReadOnlyCollection<string>(emails.ToList());
            await signalRContext.Clients.Users(list).SendAsync("updateNotesGeneral", updates);
        }

        public async Task UpdateFoldersInManyUsers(IEnumerable<UpdateFolderWS> updates, IEnumerable<string> emails)
        {
            var list = new ReadOnlyCollection<string>(emails.ToList());
            await signalRContext.Clients.Users(list).SendAsync("updateFoldersGeneral", updates);
        }

        public async Task UpdateContent(Guid noteId, string email)
        {
            Console.WriteLine(email);
            var connectionId = AppSignalRHub.usersIdentifier_ConnectionId.GetValueOrDefault(email);
            await signalRContext.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updateNoteContent", true);
        }

    }
}
