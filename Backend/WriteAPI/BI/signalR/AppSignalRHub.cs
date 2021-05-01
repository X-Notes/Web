using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Notes;
using Common.DTO.notifications;
using Common.DTO.parts;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
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
            if (user != null && Guid.TryParse(noteId, out var guid))
            {
                var existUser = await userOnNoteRepository.GetUserFromNoteByIds(user.Id, guid);
                if(existUser == null)
                {
                    var connectUser = new UserOnNoteNow()
                    {
                        UserId = user.Id,
                        NoteId = guid
                    };
                    await userOnNoteRepository.Add(connectUser);
                }
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, noteId.ToString());
        }

        public async Task LeaveNote(string noteId)
        {
            /*
            Console.WriteLine(new string('-', 30));
            Console.WriteLine("Leave");           
            Console.WriteLine(Context.ConnectionId);
            Console.WriteLine(noteId);
            Console.WriteLine(Context.UserIdentifier);
            Console.WriteLine();
            */

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, noteId.ToString());
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
                await userOnNoteRepository.RemoveFromOnline(user.Id);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
