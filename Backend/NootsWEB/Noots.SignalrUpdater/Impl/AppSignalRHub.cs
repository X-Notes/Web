using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.WS;
using Common.DTO.Parts;
using MediatR;
using Microsoft.AspNetCore.Http.Connections.Features;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Noots.DatabaseContext.Repositories.WS;
using Noots.Permissions.Queries;
using Noots.SignalrUpdater.Entities;
using Noots.SignalrUpdater.Interfaces;

namespace Noots.SignalrUpdater.Impl
{
    public class AppSignalRHub : Hub
    {
        private readonly IFolderServiceStorage folderServiceStorage;
        private readonly INoteServiceStorage noteServiceStorage;
        private readonly UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository;
        private readonly ILogger<AppSignalRHub> logger;
        private readonly IMediator mediator;

        public AppSignalRHub(
            IFolderServiceStorage folderServiceStorage,
            INoteServiceStorage noteServiceStorage,
            UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository,
            ILogger<AppSignalRHub> logger,
            IMediator _mediator)
        {
            this.folderServiceStorage = folderServiceStorage;
            this.noteServiceStorage = noteServiceStorage;
            this.userIdentifierConnectionIdRepository = userIdentifierConnectionIdRepository;
            this.logger = logger;
            mediator = _mediator;
        }

        public async Task UpdateDocumentFromClient(UpdateTextPart textPart)
        {
            IReadOnlyList<string> list = new List<string>() { Context.ConnectionId };
            await Clients.GroupExcept(textPart.NoteId, list).SendAsync("updateDoc", textPart.RawHtml);
        }

        public async Task UpdateUpdateStatus() {
            var ent = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.ConnectionId == Context.ConnectionId);
            if (ent == null)
            {
                return;
            }
            ent.UpdatedAt = DateTimeProvider.Time;
            await userIdentifierConnectionIdRepository.UpdateAsync(ent);
        }

        private Guid? GetUserId()
        {
            var isParsed = Guid.TryParse(Context.UserIdentifier, out var parsedId);
            Guid? userId = isParsed ? parsedId : null;
            return userId;
        }

        public async Task<UserIdentifierConnectionId> GetUserIdentifierConnectionAsync()
        {
            return await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.ConnectionId == Context.ConnectionId);
        }

        // NOTES
        public async Task JoinNote(Guid noteId)
        {
            var ent = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.ConnectionId == Context.ConnectionId);
            if (ent == null)
            {
                await Clients.Caller.SendAsync(ClientMethods.setJoinedToNote, new JoinEntityStatus(noteId, false));
                return;
            }

            var usersOnNote = await noteServiceStorage.UsersOnNoteAsync(noteId);
            Console.WriteLine("usersOnNote: " + usersOnNote);

            var userId = ent.GetUserId();
            if (!userId.HasValue)
            {
                await Clients.Caller.SendAsync(ClientMethods.setJoinedToNote, new JoinEntityStatus(noteId, false));
                return;
            }

            var command = new GetUserPermissionsForNoteQuery(noteId, userId.Value);
            var permission = await mediator.Send(command);
            var isCanRead = permission.CanRead;

            if (isCanRead)
            {
                await noteServiceStorage.AddAsync(noteId, ent);

                var groupId = WsNameHelper.GetNoteGroupName(noteId);
                await Groups.AddToGroupAsync(ent.ConnectionId, groupId);
                await Clients.Caller.SendAsync(ClientMethods.setJoinedToNote, new JoinEntityStatus(noteId, true));
                await Clients.Group(groupId).SendAsync(ClientMethods.updateOnlineUsersNote, noteId);
                return;
            }

            await Clients.Caller.SendAsync(ClientMethods.setJoinedToNote, new JoinEntityStatus(noteId, false));
        }

        public async Task LeaveNote(Guid noteId)
        {
            var ent = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.ConnectionId == Context.ConnectionId);
            if (ent == null) return;

            await noteServiceStorage.RemoveAsync(noteId, ent.Id);

            var userId = ent.UserId ?? ent.UnauthorizedId;
            if (userId.HasValue)
            {
                await RemoveOnlineUsersNoteAsync(noteId, ent.Id, userId.Value);
            }
        }

        private async Task RemoveOnlineUsersNoteAsync(Guid noteId, Guid userIdentifier, Guid userId)
        {
            var groupId = WsNameHelper.GetNoteGroupName(noteId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
            await Clients.Group(groupId).SendAsync(ClientMethods.removeOnlineUsersNote, new LeaveFromEntity(noteId, userIdentifier, userId));
        }

        // FOLDERS
        public async Task JoinFolder(Guid folderId)
        {
            var ent = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.ConnectionId == Context.ConnectionId);
            if (ent == null)
            {
                await Clients.Caller.SendAsync(ClientMethods.setJoinedToFolder, new JoinEntityStatus(folderId, false));
                return;
            }

            var usersOnFolder = await folderServiceStorage.UsersOnFolderAsync(folderId);
            Console.WriteLine("usersOnFolder: " + usersOnFolder);

            var userId = ent.GetUserId();
            if (!userId.HasValue)
            {
                await Clients.Caller.SendAsync(ClientMethods.setJoinedToFolder, new JoinEntityStatus(folderId, false));
                return;
            }

            var command = new GetUserPermissionsForFolderQuery(folderId, userId.Value);
            var permission = await mediator.Send(command);
            var isCanRead = permission.CanRead;

            if (isCanRead)
            {
                await folderServiceStorage.AddAsync(folderId, ent);

                var groupId = GetFolderGroupName(folderId);
                await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
                await Clients.Caller.SendAsync(ClientMethods.setJoinedToFolder, new JoinEntityStatus(folderId, true));
                await Clients.Group(groupId).SendAsync(ClientMethods.updateOnlineUsersFolder, folderId);
                return;
            }

            await Clients.Caller.SendAsync(ClientMethods.setJoinedToFolder, new JoinEntityStatus(folderId, false));
        }


        public async Task LeaveFolder(Guid folderId)
        {
            var ent = await userIdentifierConnectionIdRepository.FirstOrDefaultAsync(x => x.ConnectionId == Context.ConnectionId);
            if (ent == null) return;

            await folderServiceStorage.RemoveAsync(folderId, ent.Id);

            var userId = ent.UserId ?? ent.UnauthorizedId;
            if (userId.HasValue)
            {
                await RemoveOnlineUsersFolderAsync(folderId, ent.Id, userId.Value);
            }
        }

        private async Task RemoveOnlineUsersFolderAsync(Guid folderId, Guid userIdentifier, Guid userId)
        {
            var groupId = GetFolderGroupName(folderId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
            await Clients.Group(groupId).SendAsync(ClientMethods.removeOnlineUsersFolder, new LeaveFromEntity(folderId, userIdentifier, userId));
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
                        ConnectedAt = DateTimeProvider.Time,
                        UpdatedAt = DateTimeProvider.Time
                    };
                }
            }
            else
            {
                entity = new UserIdentifierConnectionId { 
                    ConnectionId = Context.ConnectionId,
                    UserAgent = userAgent,
                    ConnectedAt = DateTimeProvider.Time,
                    UpdatedAt = DateTimeProvider.Time,
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
            await base.OnDisconnectedAsync(exception);
            await RemoveConnectionAsync();
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
