using Common;
using Common.DatabaseModels.Models.WS;
using Common.DTO.Parts;
using Microsoft.AspNetCore.Http.Connections.Features;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Noots.DatabaseContext.Repositories.WS;
using Noots.SignalrUpdater.Interfaces;
using Noots.SignalrUpdater.Models;

namespace Noots.SignalrUpdater.Impl
{
    public class AppSignalRHub : Hub
    {
        private readonly IFolderServiceStorage folderServiceStorage;
        private readonly INoteServiceStorage noteServiceStorage;
        private readonly UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository;
        private readonly ILogger<AppSignalRHub> logger;

        public AppSignalRHub(
            IFolderServiceStorage folderServiceStorage,
            INoteServiceStorage noteServiceStorage,
            UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository,
            ILogger<AppSignalRHub> logger)
        {
            this.folderServiceStorage = folderServiceStorage;
            this.noteServiceStorage = noteServiceStorage;
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
            var ent = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.ConnectionId == Context.ConnectionId);
            if (ent == null)
            {
                return;
            }

            await noteServiceStorage.AddAsync(noteId, ent);

            var groupId = GetNoteGroupName(noteId);
            await Clients.Caller.SendAsync(ClientMethods.setJoinedToNote, noteId);
            await Groups.AddToGroupAsync(ent.ConnectionId, groupId);
            await Clients.Group(groupId).SendAsync(ClientMethods.updateOnlineUsersNote, noteId); // TODO change on userId that can be added to ui list
        }

        public async Task LeaveNote(Guid noteId)
        {
            var ent = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.ConnectionId == Context.ConnectionId);

            await noteServiceStorage.RemoveAsync(noteId, Context.ConnectionId);

            var userId = ent.UserId ?? ent.UnauthorizedId;
            if (userId != null && !userId.HasValue)
            {
                await RemoveOnlineUsersNoteAsync(noteId, userId.Value);
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
            var ent = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.ConnectionId == Context.ConnectionId);
            if (ent == null)
            {
                return;
            }

            await folderServiceStorage.AddAsync(folderId, ent);

            var groupId = GetFolderGroupName(folderId);
            await Clients.Caller.SendAsync(ClientMethods.setJoinedToFolder, folderId);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
            await Clients.Group(groupId).SendAsync(ClientMethods.updateOnlineUsersFolder, folderId); // TODO change on userId that can be added to ui list
        }


        public async Task LeaveFolder(Guid folderId)
        {
            var ent = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.ConnectionId == Context.ConnectionId);

            await folderServiceStorage.RemoveAsync(folderId, Context.ConnectionId);

            var userId = ent.UserId ?? ent.UnauthorizedId;
            if (userId != null && !userId.HasValue)
            {
                await RemoveOnlineUsersFolderAsync(folderId, userId.Value);
            }
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
            var httpContext = Context.Features.Get<IHttpContextFeature>();
            var userAgent = httpContext.HttpContext.Request.Headers["User-Agent"];

            var userId = GetUserId();
            UserIdentifierConnectionId entity = null;
            if (userId.HasValue)
            {
                entity = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.UserId == userId.Value && x.ConnectionId == Context.ConnectionId);
                if (entity == null)
                {
                    entity = new UserIdentifierConnectionId { 
                        UserId = userId.Value, 
                        ConnectionId = Context.ConnectionId,
                        UserAgent = userAgent,
                        Connected = true,
                        ConnectedAt = DateTimeProvider.Time 
                    };
                }
            }
            else
            {
                entity = new UserIdentifierConnectionId { 
                    ConnectionId = Context.ConnectionId,
                    UserAgent = userAgent,
                    Connected = true,
                    ConnectedAt = DateTimeProvider.Time,
                    UnauthorizedId = Guid.NewGuid()
                };
            }

            if (entity != null)
            {
                await userIdentifierConnectionIdRepository.AddAsync(entity);
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await RemoveConnectionAsync();
            await base.OnDisconnectedAsync(exception);
        }

        private async Task RemoveConnectionAsync()
        {
            var userId = GetUserId();
            List<UserIdentifierConnectionId> ents = null;

            if (userId.HasValue) // TODO USE DAPPER
            {
                ents = await userIdentifierConnectionIdRepository.GetWhereAsync(x => x.UserId == userId.Value && x.ConnectionId == Context.ConnectionId);
            }
            else
            {
                ents = await userIdentifierConnectionIdRepository.GetWhereAsync(x => x.ConnectionId == Context.ConnectionId);
            }

            if (ents != null && ents.Any())
            {
                await userIdentifierConnectionIdRepository.RemoveRangeAsync(ents);
            }
        }
    }
}
