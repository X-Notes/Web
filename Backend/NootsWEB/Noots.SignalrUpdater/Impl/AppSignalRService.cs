using System.Collections.ObjectModel;
using Common.DTO.Notifications;
using Common.DTO.WebSockets;
using Common.DTO.WebSockets.InnerNote;
using Common.DTO.WebSockets.Permissions;
using Common.DTO.WebSockets.ReletedNotes;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Noots.DatabaseContext.Repositories.WS;
using Noots.SignalrUpdater.Entities;
using Noots.SignalrUpdater.Interfaces;

namespace Noots.SignalrUpdater.Impl
{
    public class AppSignalRService
    {
        public IHubContext<AppSignalRHub> signalRContext;

        private readonly UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository;

        private readonly ILogger<AppSignalRService> logger;

        public AppSignalRService(
            IHubContext<AppSignalRHub> context,
            UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository,
            ILogger<AppSignalRService> logger)
        {
            signalRContext = context;

            this.userIdentifierConnectionIdRepository = userIdentifierConnectionIdRepository;
            this.logger = logger;
        }

        public Task<List<string>> GetAuthorizedConnections(List<Guid> userIds, Guid exceptUserId)
        {
            return userIdentifierConnectionIdRepository.GetConnectionsAsync(userIds, exceptUserId);
        }

        public Task<List<string>> GetAuthorizedConnections(List<Guid> userIds)
        {
            return userIdentifierConnectionIdRepository.GetConnectionsAsync(userIds);
        }

        public async Task<List<string>> GetAuthorizedConnections(Guid userId)
        {
            var connections = await userIdentifierConnectionIdRepository.GetWhereAsync(x => x.UserId == userId);
            return connections.Select(x => x.ConnectionId).ToList();
        }

        public async Task SendNewNotification(Guid userId, NotificationDTO notification)
        {
            await signalRContext.Clients.User(userId.ToString()).SendAsync(ClientMethods.newNotification, notification);
        }

        public async Task UpdateNoteClients(UpdateNoteWS updates, IEnumerable<string> connectionIds)
        {
            var list = new ReadOnlyCollection<string>(connectionIds.ToList());
            if (list.Any())
            {
                await signalRContext.Clients.Clients(list).SendAsync(ClientMethods.updateNoteGeneral, updates);
            }
        }

        public async Task UpdateNoteUsers(UpdateNoteWS updates, IEnumerable<Guid> userIds)
        {
            var list = new ReadOnlyCollection<string>(userIds.Select(x => x.ToString()).ToList());
            if (list.Any())
            {
                await signalRContext.Clients.Users(list).SendAsync(ClientMethods.updateNoteGeneral, updates);
            }
        }

        public async Task UpdateFolderClients(UpdateFolderWS updates, IEnumerable<string> connectionIds)
        {
            var list = new ReadOnlyCollection<string>(connectionIds.ToList());
            if (list.Any())
            {
                await signalRContext.Clients.Clients(list).SendAsync(ClientMethods.updateFolderGeneral, updates);
            }
        }

        public async Task UpdateFolderUsers(UpdateFolderWS updates, IEnumerable<Guid> userIds)
        {
            var list = new ReadOnlyCollection<string>(userIds.Select(x => x.ToString()).ToList());
            if (list.Any())
            {
                await signalRContext.Clients.Clients(list).SendAsync(ClientMethods.updateFolderGeneral, updates);
            }
        }

        // INNER NOTE

        public async Task UpdateRelatedNotes(Guid noteId, Guid userId, UpdateRelatedNotesWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(WsNameHelper.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updateRelatedNotes, updates);
        }

        public async Task UpdateTextContent(Guid noteId, Guid userId, UpdateTextWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(WsNameHelper.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updateTextContent, updates);
        }

        public async Task UpdateNoteStructure(Guid noteId, Guid userId, UpdateNoteStructureWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(WsNameHelper.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updateNoteStructure, updates);
        }

        public async Task UpdateUserNoteCursor(Guid noteId, UpdateCursorWS updates)
        {
            await signalRContext.Clients.Group(WsNameHelper.GetNoteGroupName(noteId)).SendAsync(ClientMethods.updateNoteUserCursor, updates);
        }

        // REMOVE USERS
        public async Task RemoveOnlineUsersNoteAsync(Guid noteId, Guid userIdentifier, Guid userId)
        {
            var groupId = WsNameHelper.GetNoteGroupName(noteId);
            var body = new LeaveFromEntity(noteId, userIdentifier, userId);
            await signalRContext.Clients.Group(groupId).SendAsync(ClientMethods.removeOnlineUsersNote, body);
        }

        public async Task RemoveOnlineUsersFolderAsync(Guid folderId, Guid userIdentifier, Guid userId)
        {
            var groupId = WsNameHelper.GetFolderGroupName(folderId);
            var body = new LeaveFromEntity(folderId, userIdentifier, userId);
            await signalRContext.Clients.Group(groupId).SendAsync(ClientMethods.removeOnlineUsersFolder, body);
        }

        // FILE CONTENT
        public async Task UpdateDocumentsCollection(Guid noteId, Guid userId, UpdateDocumentsCollectionWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(WsNameHelper.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updateDocumentsCollection, updates);
        }

        public async Task UpdatePhotosCollection(Guid noteId, Guid userId, UpdatePhotosCollectionWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(WsNameHelper.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updatePhotosCollection, updates);
        }

        public async Task UpdateVideosCollection(Guid noteId, Guid userId, UpdateVideosCollectionWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(WsNameHelper.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updateVideosCollection, updates);
        }

        public async Task UpdateAudiosCollection(Guid noteId, Guid userId, UpdateAudiosCollectionWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(WsNameHelper.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updateAudiosCollection, updates);
        }

        // Note permissions

        public async Task UpdatePermissionUserNote(UpdatePermissionNoteWS updates, Guid userId)
        {
            await signalRContext.Clients.User(userId.ToString()).SendAsync(ClientMethods.updatePermissionUserNote, updates);
        }

        // Folder permissions

        public async Task UpdatePermissionUserFolder(UpdatePermissionFolderWS updates, Guid userId)
        {
            await signalRContext.Clients.User(userId.ToString()).SendAsync(ClientMethods.updatePermissionUserFolder, updates);
        }
    }
}
