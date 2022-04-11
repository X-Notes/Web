using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO.Parts;
using Microsoft.AspNetCore.SignalR;
using WriteContext.Repositories.Users;

namespace BI.SignalR
{
    public class AppSignalRHub : Hub
    {
        public static ConcurrentDictionary<string, string> UsersIdentifier_ConnectionId { set; get; } = new();

        private readonly WebsocketsNotesServiceStorage wsNotesService;
        private readonly WebsocketsFoldersServiceStorage wsFoldersService;

        public AppSignalRHub(
            WebsocketsNotesServiceStorage websocketsNotesService,
            WebsocketsFoldersServiceStorage websocketsFoldersService)
        {
            this.wsNotesService = websocketsNotesService;
            this.wsFoldersService = websocketsFoldersService;
        }

        public async Task UpdateDocumentFromClient(UpdateTextPart textPart)
        {
            IReadOnlyList<string> list = new List<string>() { Context.ConnectionId };
            await Clients.GroupExcept(textPart.NoteId, list).SendAsync("updateDoc", textPart.RawHtml);
        }

        // NOTES
        public async Task JoinNote(Guid noteId)
        {
            if (wsNotesService.IsContainsConnectionId(noteId, Context.ConnectionId) || wsNotesService.Add(noteId, Context.ConnectionId, GetUserId()))
            {
                var groupId = GetNoteGroupName(noteId);
                await Clients.Caller.SendAsync("setJoinedToNote", noteId);
                await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
                await Clients.Group(groupId).SendAsync("updateOnlineUsersNote", noteId); // TODO change on userId that can be added to ui list
            }
        }

        private Guid? GetUserId()
        {
            var isParsed = Guid.TryParse(Context.UserIdentifier, out var parsedId);
            Guid? userId = isParsed ? parsedId : null;
            return userId;
        }

        public async Task LeaveNote(Guid noteId)
        {
            var isSuccess = wsNotesService.Remove(noteId, Context.ConnectionId);
            if (!isSuccess)
            {
                Console.WriteLine("User did`nt deleted from online on note, UserId: " + GetUserId());
            }

            var groupId = GetNoteGroupName(noteId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
            await Clients.Group(groupId).SendAsync("updateOnlineUsersNote", noteId);
        }

        private string GetNoteGroupName(Guid id) => "N-" + id.ToString();

        // FOLDERS
        public async Task JoinFolder(Guid folderId)
        {
            if (wsFoldersService.IsContainsConnectionId(folderId, Context.ConnectionId) || wsFoldersService.Add(folderId, Context.ConnectionId, GetUserId()))
            {
                var groupId = GetFolderGroupName(folderId);
                await Clients.Caller.SendAsync("setJoinedToFolder", folderId);
                await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
                await Clients.Group(groupId).SendAsync("updateOnlineUsersFolder", folderId); // TODO change on userId that can be added to ui list
            }
        }

        public async Task LeaveFolder(Guid folderId)
        {
            var isSuccess = wsFoldersService.Remove(folderId, Context.ConnectionId);

            if (!isSuccess)
            {
                Console.WriteLine("User did`nt deleted from online on folder, UserId: " + GetUserId());
            }

            var groupId = GetFolderGroupName(folderId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
            await Clients.Group(groupId).SendAsync("updateOnlineUsersFolder", folderId);
        }

        private string GetFolderGroupName(Guid id) => "F-" + id.ToString();

        public override Task OnConnectedAsync()
        {
            if (!string.IsNullOrEmpty(Context.UserIdentifier))
            {
                UsersIdentifier_ConnectionId.TryAdd(Context.UserIdentifier, Context.ConnectionId);
            } 
         
            return base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            UsersIdentifier_ConnectionId.Remove(Context.UserIdentifier, out var value);

            // TODO MAYBE THERE ARE NEED DISCONNECT FROM FOLDER AND NOTE
            // If need use channels or background jobs

            await base.OnDisconnectedAsync(exception);
        }
    }
}
