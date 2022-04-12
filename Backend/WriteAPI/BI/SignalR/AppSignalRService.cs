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
                var connections = AppSignalRHub.GetConnectionsByUserId(id);
                if (connections != null && connections.Any())
                {
                    result.AddRange(connections);
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
            var connectionsId = AppSignalRHub.GetConnectionsByUserId(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync("updateTextContent", updates);
        }

        public async Task UpdateNoteStructure(Guid noteId, Guid userId, UpdateNoteStructureWS updates)
        {
            var connectionsId = AppSignalRHub.GetConnectionsByUserId(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync("updateNoteStructure", updates);
        }

        // FILE CONTENT
        public async Task UpdateDocumentsCollection(Guid noteId, Guid userId, UpdateDocumentsCollectionWS updates)
        {
            var connectionsId = AppSignalRHub.GetConnectionsByUserId(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync("updateDocumentsCollection", updates);
        }

        public async Task UpdatePhotosCollection(Guid noteId, Guid userId, UpdatePhotosCollectionWS updates)
        {
            var connectionsId = AppSignalRHub.GetConnectionsByUserId(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync("updatePhotosCollection", updates);
        }

        public async Task UpdateVideosCollection(Guid noteId, Guid userId, UpdateVideosCollectionWS updates)
        {
            var connectionsId = AppSignalRHub.GetConnectionsByUserId(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync("updateVideosCollection", updates);
        }

        public async Task UpdateAudiosCollection(Guid noteId, Guid userId, UpdateAudiosCollectionWS updates)
        {
            var connectionsId = AppSignalRHub.GetConnectionsByUserId(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync("updateAudiosCollection", updates);
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
