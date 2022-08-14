using Common;
using Common.DatabaseModels.Models.WS;
using Common.DTO.Parts;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Noots.SignalrUpdater.Models;
using WriteContext.Repositories.WS;

namespace Noots.SignalrUpdater.Impl
{
    public class AppSignalRHub : Hub
    {
        private readonly WebsocketsNotesServiceStorage wsNotesService;
        private readonly WebsocketsFoldersServiceStorage wsFoldersService;
        private readonly UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository;
        private readonly ILogger<AppSignalRHub> logger;

        public AppSignalRHub(
            WebsocketsNotesServiceStorage websocketsNotesService,
            WebsocketsFoldersServiceStorage websocketsFoldersService,
            UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository,
            ILogger<AppSignalRHub> logger)
        {
            wsNotesService = websocketsNotesService;
            wsFoldersService = websocketsFoldersService;
            this.userIdentifierConnectionIdRepository = userIdentifierConnectionIdRepository;
            this.logger = logger;
        }

        public async Task UpdateDocumentFromClient(UpdateTextPart textPart)
        {
            IReadOnlyList<string> list = new List<string>() { Context.ConnectionId };
            await Clients.GroupExcept(textPart.NoteId, list).SendAsync("updateDoc", textPart.RawHtml);
        }

        private Guid? GetUserId()
        {
            var isParsed = Guid.TryParse(Context.UserIdentifier, out var parsedId);
            Guid? userId = isParsed ? parsedId : null;
            return userId;
        }

        // NOTES
        public async Task JoinNote(Guid noteId)
        {
            if (wsNotesService.IsContainsConnectionId(noteId, Context.ConnectionId))
            {
                return;
            }

            var ent = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.ConnectionId == Context.ConnectionId);
            if (ent == null)
            {
                return;
            }

            if (wsNotesService.Add(noteId, ent))
            {
                var groupId = GetNoteGroupName(noteId);
                await Clients.Caller.SendAsync(ClientMethods.setJoinedToNote, noteId);
                await Groups.AddToGroupAsync(ent.ConnectionId, groupId);
                await Clients.Group(groupId).SendAsync(ClientMethods.updateOnlineUsersNote, noteId); // TODO change on userId that can be added to ui list
            }
        }

        public async Task LeaveNote(Guid noteId)
        {
            var result = wsNotesService.Remove(noteId, Context.ConnectionId);
            if (!result.isRemoved)
            {
                logger.LogError("User did`nt deleted from online on note, UserId: " + GetUserId());
                return;
            }

            if (result.user != null)
            {
                await RemoveOnlineUsersNoteAsync(noteId, result.user.Id);
            }
        }

        private async Task RemoveOnlineUsersNoteAsync(Guid noteId, Guid userIdentifier)
        {
            var groupId = GetNoteGroupName(noteId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
            await Clients.Group(groupId).SendAsync(ClientMethods.removeOnlineUsersNote, new LeaveFromEntity { EntityId = noteId, UserIdentifier = userIdentifier });
        }

        public static string GetNoteGroupName(Guid id) => "N-" + id.ToString();

        // FOLDERS
        public async Task JoinFolder(Guid folderId)
        {
            if (wsFoldersService.IsContainsConnectionId(folderId, Context.ConnectionId))
            {
                return;
            }

            var ent = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.ConnectionId == Context.ConnectionId);
            if (ent == null)
            {
                return;
            }

            if (wsFoldersService.Add(folderId, ent))
            {
                var groupId = GetFolderGroupName(folderId);
                await Clients.Caller.SendAsync(ClientMethods.setJoinedToFolder, folderId);
                await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
                await Clients.Group(groupId).SendAsync(ClientMethods.updateOnlineUsersFolder, folderId); // TODO change on userId that can be added to ui list
            }
        }


        public async Task LeaveFolder(Guid folderId)
        {
            var result = wsFoldersService.Remove(folderId, Context.ConnectionId);
            if (!result.isRemoved)
            {
                logger.LogError("User did`nt deleted from online on folder, UserId: " + GetUserId());
                return;
            }

            await RemoveOnlineUsersFolderAsync(folderId, result.user.Id);
        }

        private async Task RemoveOnlineUsersFolderAsync(Guid folderId, Guid userIdentifier)
        {
            var groupId = GetFolderGroupName(folderId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
            await Clients.Group(groupId).SendAsync(ClientMethods.removeOnlineUsersFolder, new LeaveFromEntity { EntityId = folderId, UserIdentifier = userIdentifier });
        }

        public static string GetFolderGroupName(Guid id) => "F-" + id.ToString();

        // override
        public override async Task OnConnectedAsync()
        {
            await AddConnectionAsync();

            await base.OnConnectedAsync();
        }

        private async Task AddConnectionAsync()
        {
            var userId = GetUserId();
            UserIdentifierConnectionId entity = null;
            if (userId.HasValue)
            {
                entity = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.UserId == userId.Value && x.ConnectionId == Context.ConnectionId);
                if (entity == null)
                {
                    entity = new UserIdentifierConnectionId { UserId = userId.Value, ConnectionId = Context.ConnectionId, ConnectedAt = DateTimeProvider.Time };
                }
            }
            else
            {
                entity = new UserIdentifierConnectionId { ConnectionId = Context.ConnectionId, ConnectedAt = DateTimeProvider.Time };
            }

            if (entity != null)
            {
                await userIdentifierConnectionIdRepository.AddAsync(entity);
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await RemoveConnectionAsync();

            var folderEnts = wsFoldersService.RemoveUserFromEntities(Context.ConnectionId);
            foreach (var ent in folderEnts)
            {
                await RemoveOnlineUsersFolderAsync(ent.entityId, ent.userId);
            }

            var noteEnts = wsNotesService.RemoveUserFromEntities(Context.ConnectionId);
            foreach (var ent in noteEnts)
            {
                await RemoveOnlineUsersNoteAsync(ent.entityId, ent.userId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        private async Task RemoveConnectionAsync()
        {
            var userId = GetUserId();
            UserIdentifierConnectionId entity = null;
            if (userId.HasValue) // USE DAPPER
            {
                entity = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.UserId == userId.Value && x.ConnectionId == Context.ConnectionId);
            }
            else
            {
                entity = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.ConnectionId == Context.ConnectionId);
            }
            if (entity != null)
            {
                await userIdentifierConnectionIdRepository.RemoveAsync(entity);
            }
        }
    }
}
