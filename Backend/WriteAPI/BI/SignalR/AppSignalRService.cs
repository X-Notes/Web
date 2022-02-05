using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.Notes;
using Common.DTO.WebSockets;
using Common.DTO.WebSockets.InnerNote;
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

        public async Task UpdateNotesInManyUsers(UpdateNoteWS updates, IEnumerable<string> emails)
        {
            var list = new ReadOnlyCollection<string>(emails.ToList());
            await signalRContext.Clients.Users(list).SendAsync("updateNotesGeneral", updates);
        }

        public async Task UpdateFoldersInManyUsers(UpdateFolderWS updates, IEnumerable<string> emails)
        {
            var list = new ReadOnlyCollection<string>(emails.ToList());
            await signalRContext.Clients.Users(list).SendAsync("updateFoldersGeneral", updates);
        }

        public async Task UpdateTextContent(Guid noteId, string email, UpdateTextWS updates)
        {
            var connectionId = AppSignalRHub.usersIdentifier_ConnectionId.GetValueOrDefault(email);
            await signalRContext.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updateTextContent", updates);
        }

        public async Task UpdateNoteStructure(Guid noteId, string email, UpdateNoteStructureWS updates)
        {
            var connectionId = AppSignalRHub.usersIdentifier_ConnectionId.GetValueOrDefault(email);
            await signalRContext.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updateNoteStructure", updates);
        }

        // FILE CONTENT
        public async Task UpdateDocumentsCollection(Guid noteId, string email, UpdateDocumentsCollectionWS updates)
        {
            var connectionId = AppSignalRHub.usersIdentifier_ConnectionId.GetValueOrDefault(email);
            await signalRContext.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updateDocumentsCollection", updates);
        }

        public async Task UpdatePhotosCollection(Guid noteId, string email, UpdatePhotosCollectionWS updates)
        {
            var connectionId = AppSignalRHub.usersIdentifier_ConnectionId.GetValueOrDefault(email);
            await signalRContext.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updatePhotosCollection", updates);
        }

        public async Task UpdateVideosCollection(Guid noteId, string email, UpdateVideosCollectionWS updates)
        {
            var connectionId = AppSignalRHub.usersIdentifier_ConnectionId.GetValueOrDefault(email);
            await signalRContext.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updateVideosCollection", updates);
        }

        public async Task UpdateAudiosCollection(Guid noteId, string email, UpdateAudiosCollectionWS updates)
        {
            var connectionId = AppSignalRHub.usersIdentifier_ConnectionId.GetValueOrDefault(email);
            await signalRContext.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updateAudiosCollection", updates);
        }
    }
}
