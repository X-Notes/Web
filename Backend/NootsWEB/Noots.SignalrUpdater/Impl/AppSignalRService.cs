using System.Collections.ObjectModel;
using Common;
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

        public async Task UpdateUpdateStatus(Guid userId, string connectionId)
        {
            var ent = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.UserId == userId && x.ConnectionId == connectionId);
            if (ent == null)
            {
                return;
            }
            ent.UpdatedAt = DateTimeProvider.Time;
            await userIdentifierConnectionIdRepository.UpdateAsync(ent);
        }

        public Task<List<string>> GetAuthorizedConnections(List<Guid> userIds)
        {
            return userIdentifierConnectionIdRepository.GetConnectionsAsync(userIds);
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

        public async Task UpdateFolderClients(UpdateFolderWS updates, IEnumerable<string> connectionIds)
        {
            var list = new ReadOnlyCollection<string>(connectionIds.ToList());
            if (list.Any())
            {
                await signalRContext.Clients.Clients(list).SendAsync(ClientMethods.updateFolderGeneral, updates);
            }
        }

        // INNER NOTE

        public async Task UpdateRelatedNotes(UpdateRelatedNotesWS updates, IEnumerable<string> connectionIds)
        {
            if (connectionIds.Any())
            {
                await signalRContext.Clients.Clients(connectionIds).SendAsync(ClientMethods.updateRelatedNotes, updates);
            }
        }

        public async Task UpdateTextContent(UpdateTextWS updates, IEnumerable<string> connectionIds)
        {
            if (connectionIds.Any())
            {
                await signalRContext.Clients.Clients(connectionIds).SendAsync(ClientMethods.updateTextContent, updates);
            }
        }

        public async Task UpdateNoteStructure(UpdateNoteStructureWS updates, IEnumerable<string> connectionIds)
        {
            if (connectionIds.Any())
            {
                await signalRContext.Clients.Clients(connectionIds).SendAsync(ClientMethods.updateNoteStructure, updates);
            }
        }

        public async Task UpdateUserNoteCursor(UpdateCursorWS updates, IEnumerable<string> connectionIds)
        {
            if (connectionIds.Any())
            {
                await signalRContext.Clients.Clients(connectionIds).SendAsync(ClientMethods.updateNoteUserCursor, updates);
            }
        }

        // REMOVE USERS
        public async Task RemoveOnlineUsersNoteAsync(Guid noteId, Guid userIdentifier, Guid userId, List<Guid> usersToSendIds)
        {
            var body = new LeaveFromEntity(noteId, userIdentifier, userId);

            var ids = usersToSendIds.Select(x => x.ToString());
            await signalRContext.Clients.Users(ids).SendAsync(ClientMethods.removeOnlineUsersNote, body);
        }

        public async Task RemoveOnlineUsersFolderAsync(Guid folderId, Guid userIdentifier, Guid userId, List<Guid> usersToSendIds)
        {
            var body = new LeaveFromEntity(folderId, userIdentifier, userId);

            var ids = usersToSendIds.Select(x => x.ToString());
            await signalRContext.Clients.Users(ids).SendAsync(ClientMethods.removeOnlineUsersFolder, body);
        }

        // FILE CONTENT
        public async Task UpdateDocumentsCollection(IEnumerable<string> connectionIds, UpdateDocumentsCollectionWS updates)
        {
            if (connectionIds.Any())
            {
                await signalRContext.Clients.Clients(connectionIds).SendAsync(ClientMethods.updateDocumentsCollection, updates);
            }
        }

        public async Task UpdatePhotosCollection(IEnumerable<string> connectionIds, UpdatePhotosCollectionWS updates)
        {
            if (connectionIds.Any())
            {
                await signalRContext.Clients.Clients(connectionIds).SendAsync(ClientMethods.updatePhotosCollection, updates);
            }
        }

        public async Task UpdateVideosCollection(IEnumerable<string> connectionIds, UpdateVideosCollectionWS updates)
        {
            if (connectionIds.Any())
            {
                await signalRContext.Clients.Clients(connectionIds).SendAsync(ClientMethods.updateVideosCollection, updates);
            }
        }

        public async Task UpdateAudiosCollection(IEnumerable<string> connectionIds, UpdateAudiosCollectionWS updates)
        {
            if (connectionIds.Any())
            {
                await signalRContext.Clients.Clients(connectionIds).SendAsync(ClientMethods.updateAudiosCollection, updates);
            }
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
