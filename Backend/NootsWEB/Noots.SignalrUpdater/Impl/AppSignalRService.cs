using System.Collections.ObjectModel;
using Common.DTO.WebSockets;
using Common.DTO.WebSockets.InnerNote;
using Common.DTO.WebSockets.Permissions;
using Common.DTO.WebSockets.ReletedNotes;
using Microsoft.AspNetCore.SignalR;
using Noots.DatabaseContext.Repositories.WS;
using Noots.SignalrUpdater.Models;

namespace Noots.SignalrUpdater.Impl
{
    public class AppSignalRService
    {
        public IHubContext<AppSignalRHub> signalRContext;

        private readonly UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository;

        public AppSignalRService(
            IHubContext<AppSignalRHub> context,
            UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository)
        {
            signalRContext = context;
            this.userIdentifierConnectionIdRepository = userIdentifierConnectionIdRepository;
        }


        public async Task<IEnumerable<string>> GetAuthorizedConnections(List<Guid> userIds, Guid exceptUserId)
        {
            var connections = await userIdentifierConnectionIdRepository.GetWhereAsync(x => x.UserId != null && x.UserId != exceptUserId && userIds.Contains(x.UserId.Value));
            return connections.Select(x => x.ConnectionId);
        }

        public async Task<List<string>> GetAuthorizedConnections(Guid userId)
        {
            var connections = await userIdentifierConnectionIdRepository.GetWhereAsync(x => x.UserId == userId);
            return connections.Select(x => x.ConnectionId).ToList();
        }

        public async Task SendNewNotification(Guid userId, bool flag)
        {
            await signalRContext.Clients.User(userId.ToString()).SendAsync(ClientMethods.newNotification, flag);
        }

        public async Task UpdateNoteInManyUsers(UpdateNoteWS updates, IEnumerable<string> connectionIds)
        {
            var list = new ReadOnlyCollection<string>(connectionIds.ToList());
            if (list.Any())
            {
                await signalRContext.Clients.Clients(list).SendAsync(ClientMethods.updateNoteGeneral, updates);
            }
        }

        public async Task UpdateFolderInManyUsers(UpdateFolderWS updates, IEnumerable<string> connectionIds)
        {
            var list = new ReadOnlyCollection<string>(connectionIds.ToList());
            if (list.Any())
            {
                await signalRContext.Clients.Clients(list).SendAsync(ClientMethods.updateFolderGeneral, updates);
            }
        }

        // INNER NOTE

        public async Task UpdateRelatedNotes(Guid noteId, Guid userId, UpdateRelatedNotesWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updateRelatedNotes, updates);
        }

        public async Task UpdateTextContent(Guid noteId, Guid userId, UpdateTextWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updateTextContent, updates);
        }

        public async Task UpdateNoteStructure(Guid noteId, Guid userId, UpdateNoteStructureWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updateNoteStructure, updates);
        }

        // FILE CONTENT
        public async Task UpdateDocumentsCollection(Guid noteId, Guid userId, UpdateDocumentsCollectionWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updateDocumentsCollection, updates);
        }

        public async Task UpdatePhotosCollection(Guid noteId, Guid userId, UpdatePhotosCollectionWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updatePhotosCollection, updates);
        }

        public async Task UpdateVideosCollection(Guid noteId, Guid userId, UpdateVideosCollectionWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updateVideosCollection, updates);
        }

        public async Task UpdateAudiosCollection(Guid noteId, Guid userId, UpdateAudiosCollectionWS updates)
        {
            var connectionsId = await GetAuthorizedConnections(userId);
            await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync(ClientMethods.updateAudiosCollection, updates);
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
