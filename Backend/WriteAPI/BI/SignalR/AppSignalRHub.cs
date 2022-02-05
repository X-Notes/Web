using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Notes;
using Common.DTO.Parts;
using Microsoft.AspNetCore.SignalR;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Users;

namespace BI.SignalR
{
    public class AppSignalRHub : Hub
    {
        public static ConcurrentDictionary<string, string> usersIdentifier_ConnectionId = new ConcurrentDictionary<string, string>();

        private readonly UserRepository userRepository;
        private readonly NoteRepository noteRepository;
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
        private readonly WebsocketsNotesService websocketsNotesService;
        private readonly WebsocketsFoldersService websocketsFoldersService;

        public AppSignalRHub(
            UserRepository userRepository, 
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
            NoteRepository noteRepository,
            WebsocketsNotesService websocketsNotesService,
            WebsocketsFoldersService websocketsFoldersService)
        {
            this.userRepository = userRepository;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;;
            this.noteRepository = noteRepository;
            this.websocketsNotesService = websocketsNotesService;
            this.websocketsFoldersService = websocketsFoldersService;
        }

        public async Task UpdateDocumentFromClient(UpdateTextPart textPart)
        {
            IReadOnlyList<string> list = new List<string>() { Context.ConnectionId };
            await Clients.GroupExcept(textPart.NoteId, list).SendAsync("updateDoc", textPart.RawHtml);
        }

        // NOTES
        public async Task JoinNote(Guid noteId)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == Context.UserIdentifier);
            if (user != null)
            {
                if (websocketsNotesService.IsContainsUserId(noteId, user.Id) || websocketsNotesService.Add(noteId, user.Id))
                {
                    var groupId = GetNoteGroupName(noteId);
                    await Clients.Caller.SendAsync("setJoinedToNote", noteId);
                    await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
                    await Clients.Group(groupId).SendAsync("updateOnlineUsersNote", noteId); // TODO change on userId that can be added to ui list
                }
            }
        }

        public async Task LeaveNote(Guid noteId)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == Context.UserIdentifier);
            if (user != null)
            {
                var isSuccess = websocketsNotesService.Remove(noteId, user.Id);

                if (!isSuccess)
                {
                    Console.WriteLine("User did`nt deleted from online on note, UserId: " + user.Id);
                }

                var groupId = GetNoteGroupName(noteId);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
                await Clients.Group(groupId).SendAsync("updateOnlineUsersNote", noteId);
            }
        }

        private string GetNoteGroupName(Guid id) => "N-" + id.ToString();

        // FOLDERS
        public async Task JoinFolder(Guid folderId)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == Context.UserIdentifier);
            if (user != null)
            {
                if (websocketsFoldersService.IsContainsUserId(folderId, user.Id) || websocketsFoldersService.Add(folderId, user.Id))
                {
                    var groupId = GetFolderGroupName(folderId);
                    await Clients.Caller.SendAsync("setJoinedToFolder", folderId);
                    await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
                    await Clients.Group(groupId).SendAsync("updateOnlineUsersFolder", folderId); // TODO change on userId that can be added to ui list
                }
            }
        }

        public async Task LeaveFolder(Guid folderId)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == Context.UserIdentifier);
            if (user != null)
            {
                var isSuccess = websocketsFoldersService.Remove(folderId, user.Id);

                if (!isSuccess)
                {
                    Console.WriteLine("User did`nt deleted from online on folder, UserId: " + user.Id);
                }

                var groupId = GetFolderGroupName(folderId);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
                await Clients.Group(groupId).SendAsync("updateOnlineUsersFolder", folderId);
            }
        }

        private string GetFolderGroupName(Guid id) => "F-" + id.ToString();

        public override Task OnConnectedAsync()
        {
            usersIdentifier_ConnectionId.TryAdd(Context.UserIdentifier, Context.ConnectionId);
            return base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            usersIdentifier_ConnectionId.TryRemove(Context.UserIdentifier, out var value);

            // TODO MAYBE THERE ARE NEED DISCONNECT FROM FOLDER AND NOTE
            // If need use channels or background jobs

            await base.OnDisconnectedAsync(exception);
        }
    }
}
