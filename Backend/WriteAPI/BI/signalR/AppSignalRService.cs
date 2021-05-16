using Common.DTO.notes;
using Common.DTO.notifications;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BI.signalR
{
    public class AppSignalRService
    {
        public IHubContext<AppSignalRHub> context;
        public AppSignalRService(IHubContext<AppSignalRHub> context)
        {
            this.context = context;
        }

        public async Task SendNewNotification(string receiverEmail, bool flag)
        {
            await context.Clients.User(receiverEmail).SendAsync("newNotification", flag);
        }

        public async Task UpdateGeneralFullNote(FullNote note)
        {
            await context.Clients.Group(note.Id.ToString()).SendAsync("updateNoteGeneral", note);
        }

        public async Task UpdateContent(Guid noteId, string email)
        {
            Console.WriteLine(email);
            var connectionId = AppSignalRHub.usersIdentifier_ConnectionId.GetValueOrDefault(email);
            await context.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updateNoteContent", true);
        }

    }
}
