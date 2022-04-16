using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.Notes;
using Common.DTO.WebSockets;
using Common.DTO.WebSockets.InnerNote;
using Common.DTO.WebSockets.Permissions;
using Microsoft.AspNetCore.SignalR;
using WriteContext.Repositories.WS;

namespace BI.SignalR
{
    public class AppSignalRService
    {
        public IHubContext<AppSignalRHub> signalRContext;

        private readonly UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository;

        public AppSignalRService(
            IHubContext<AppSignalRHub> context,
            UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository)
        {
            this.signalRContext = context;
            this.userIdentifierConnectionIdRepository = userIdentifierConnectionIdRepository;
        }

        public async Task<IEnumerable<string>> GetAuthorizedConnections(List<Guid> userIds)
        {
            var connections = await userIdentifierConnectionIdRepository.GetWhereAsync(x => userIds.Contains(x.UserId));
            return connections.Select(x => x.ConnectionId);
        }

        public async Task<List<string>> GetAuthorizedConnections(Guid userId)
        {
            var connections = await userIdentifierConnectionIdRepository.GetWhereAsync(x => x.UserId == userId);
            return connections.Select(x => x.ConnectionId).ToList();
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
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync("updateTextContent", updates);
        }

        public async Task UpdateNoteStructure(Guid noteId, Guid userId, UpdateNoteStructureWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync("updateNoteStructure", updates);
        }

        // FILE CONTENT
        public async Task UpdateDocumentsCollection(Guid noteId, Guid userId, UpdateDocumentsCollectionWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync("updateDocumentsCollection", updates);
        }

        public async Task UpdatePhotosCollection(Guid noteId, Guid userId, UpdatePhotosCollectionWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync("updatePhotosCollection", updates);
        }

        public async Task UpdateVideosCollection(Guid noteId, Guid userId, UpdateVideosCollectionWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync("updateVideosCollection", updates);
        }

        public async Task UpdateAudiosCollection(Guid noteId, Guid userId, UpdateAudiosCollectionWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync("updateAudiosCollection", updates);
        }

        // Note permissions

        public async Task UpdatePermissionUserNote(UpdatePermissionNoteWS updates, Guid userId)
        {
            await signalRContext.Clients.User(userId.ToString()).SendAsync("updatePermissionUserNote", updates);
        }

        // Folder permissions

        public async Task UpdatePermissionUserFolder(UpdatePermissionFolderWS updates, Guid userId)
        {
            await signalRContext.Clients.User(userId.ToString()).SendAsync("updatePermissionUserFolder", updates);
        }
    }
}
