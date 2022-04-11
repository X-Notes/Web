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

        public List<string> GetConnections(List<Guid> userIds)
        {
            List<string> result = new();

            foreach(var id in userIds)
            {
                var connection = AppSignalRHub.UsersIdentifier_ConnectionId.GetValueOrDefault(id.ToString());
                if (connection != null)
                {
                    result.Add(connection);
                }
            }

            return result;
        }

        public async Task SendNewNotification(Guid userId, bool flag)
        {         
            await signalRContext.Clients.User(userId.ToString()).SendAsync("newNotification", flag);
        }

        public async Task UpdateNotesInManyUsers(UpdateNoteWS updates, IEnumerable<string> connectionIds)
        {
            var list = new ReadOnlyCollection<string>(connectionIds.ToList());
            await signalRContext.Clients.Clients(list).SendAsync("updateNotesGeneral", updates);
        }

        public async Task UpdateFoldersInManyUsers(UpdateFolderWS updates, IEnumerable<string> connectionIds)
        {
            var list = new ReadOnlyCollection<string>(connectionIds.ToList());
            await signalRContext.Clients.Clients(list).SendAsync("updateFoldersGeneral", updates);
        }

        // INNER NOTE

        public async Task UpdateTextContent(Guid noteId, Guid userId, UpdateTextWS updates)
        {
            var connectionId = AppSignalRHub.UsersIdentifier_ConnectionId.GetValueOrDefault(userId.ToString());
            await signalRContext.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updateTextContent", updates);
        }

        public async Task UpdateNoteStructure(Guid noteId, Guid userId, UpdateNoteStructureWS updates)
        {
            var connectionId = AppSignalRHub.UsersIdentifier_ConnectionId.GetValueOrDefault(userId.ToString());
            await signalRContext.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updateNoteStructure", updates);
        }

        // FILE CONTENT
        public async Task UpdateDocumentsCollection(Guid noteId, Guid userId, UpdateDocumentsCollectionWS updates)
        {
            var connectionId = AppSignalRHub.UsersIdentifier_ConnectionId.GetValueOrDefault(userId.ToString());
            await signalRContext.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updateDocumentsCollection", updates);
        }

        public async Task UpdatePhotosCollection(Guid noteId, Guid userId, UpdatePhotosCollectionWS updates)
        {
            var connectionId = AppSignalRHub.UsersIdentifier_ConnectionId.GetValueOrDefault(userId.ToString());
            await signalRContext.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updatePhotosCollection", updates);
        }

        public async Task UpdateVideosCollection(Guid noteId, Guid userId, UpdateVideosCollectionWS updates)
        {
            var connectionId = AppSignalRHub.UsersIdentifier_ConnectionId.GetValueOrDefault(userId.ToString());
            await signalRContext.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updateVideosCollection", updates);
        }

        public async Task UpdateAudiosCollection(Guid noteId, Guid userId, UpdateAudiosCollectionWS updates)
        {
            var connectionId = AppSignalRHub.UsersIdentifier_ConnectionId.GetValueOrDefault(userId.ToString());
            await signalRContext.Clients.GroupExcept(noteId.ToString(), connectionId).SendAsync("updateAudiosCollection", updates);
        }

        // Note permissions

        public async Task RevokePermissionUserNote(Guid noteId, Guid userId)
        {
            await signalRContext.Clients.User(userId.ToString()).SendAsync("revokeNotePermissions", noteId);
        }

        public async Task AddNoteToShared(Guid noteId, Guid userId)
        {
            await signalRContext.Clients.User(userId.ToString()).SendAsync("addNoteToShared", noteId);
        }

        // Folder permissions

        public async Task RevokePermissionUserFolder(Guid folderId, Guid userId)
        {
            await signalRContext.Clients.User(userId.ToString()).SendAsync("revokeFolderPermissions", folderId);
        }

        public async Task AddFolderToShared(Guid folderId, Guid userId)
        {
            await signalRContext.Clients.User(userId.ToString()).SendAsync("addFolderToShared", folderId);
        }
    }
}
