using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Notes;
using Common.DTO.notifications;
using Common.DTO.parts;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Users;

namespace BI.signalR
{
    public class AppSignalRHub : Hub
    {
        private readonly UserRepository userRepository;
        private readonly UserOnNoteRepository userOnNoteRepository;
        public AppSignalRHub(UserRepository userRepository, UserOnNoteRepository userOnNoteRepository)
        {
            this.userRepository = userRepository;
            this.userOnNoteRepository = userOnNoteRepository;
        }

        public async Task UpdateDocumentFromClient(UpdateTextPart textPart)
        {
            IReadOnlyList<string> list = new List<string>() { Context.ConnectionId };
            await Clients.GroupExcept(textPart.NoteId, list).SendAsync("updateDoc", textPart.RawHtml);
        }

        public async Task JoinNote(string noteId)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == Context.UserIdentifier);
            if (user != null && Guid.TryParse(noteId, out var parsedNoteId))
            {
                var existUser = await userOnNoteRepository.FirstOrDefault(x => x.NoteId == parsedNoteId && x.UserId == user.Id);
                if(existUser == null)
                {
                    var connectUser = new UserOnNoteNow()
                    {
                        UserId = user.Id,
                        NoteId = parsedNoteId
                    };
                    await userOnNoteRepository.Add(connectUser);
                }
                await Groups.AddToGroupAsync(Context.ConnectionId, noteId);
                await Clients.Group(noteId).SendAsync("updateOnlineUsers", noteId);
            }
        }

        public async Task LeaveNote(string noteId)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == Context.UserIdentifier);
            if (user != null && Guid.TryParse(noteId, out var parsedNoteId))
            {
                var users = await userOnNoteRepository.GetWhere(x => x.UserId == user.Id);
                if(users.Any())
                {
                    await userOnNoteRepository.RemoveRange(users);
                }
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, noteId);
                await Clients.Group(noteId).SendAsync("updateOnlineUsers", noteId);
            }
        }

        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == Context.UserIdentifier);
            if (user != null)
            {
                var connections = await userOnNoteRepository.GetWhere(x => x.UserId == user.Id);
                if(connections.Any())
                {
                    await userOnNoteRepository.RemoveRange(connections);
                    foreach(var connection in connections)
                    {
                        var stringConnection = connection.NoteId.ToString();
                        await Clients.Group(stringConnection).SendAsync("updateOnlineUsers", stringConnection);
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
