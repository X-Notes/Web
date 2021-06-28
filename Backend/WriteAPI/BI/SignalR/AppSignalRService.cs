using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO.Notes;
using Microsoft.AspNetCore.SignalR;

namespace BI.SignalR
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
