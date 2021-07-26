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
        private readonly UserOnNoteRepository userOnNoteRepository;
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
        public AppSignalRHub(
            UserRepository userRepository, 
            UserOnNoteRepository userOnNoteRepository,
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
            NoteRepository noteRepository)
        {
            this.userRepository = userRepository;
            this.userOnNoteRepository = userOnNoteRepository;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;;
            this.noteRepository = noteRepository;
        }

        public async Task UpdateDocumentFromClient(UpdateTextPart textPart)
        {
            IReadOnlyList<string> list = new List<string>() { Context.ConnectionId };
            await Clients.GroupExcept(textPart.NoteId, list).SendAsync("updateDoc", textPart.RawHtml);
        }

        public async Task JoinNote(string noteId)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == Context.UserIdentifier);
            if (user != null && Guid.TryParse(noteId, out var parsedNoteId))
            {
                await TryToSetAsOnline(parsedNoteId, user.Id);
                await JoinUserToNote(parsedNoteId, user.Id);
                await Groups.AddToGroupAsync(Context.ConnectionId, noteId);
                await Clients.Group(noteId).SendAsync("updateOnlineUsers", noteId);
            }
        }

        public async Task TryToSetAsOnline(Guid parsedNoteId, Guid userId)
        {
            var existUser = await userOnNoteRepository.FirstOrDefaultAsync(x => x.NoteId == parsedNoteId && x.UserId == userId);
            if (existUser == null)
            {
                var connectUser = new UserOnNoteNow()
                {
                    UserId = userId,
                    NoteId = parsedNoteId
                };
                await userOnNoteRepository.AddAsync(connectUser);
            }
        }

        public async Task JoinUserToNote(Guid parsedNoteId, Guid userId) // TODO MAKE THIS FOR FOLDER
        {
            var existUser = await usersOnPrivateNotesRepository.FirstOrDefaultAsync(x => x.NoteId == parsedNoteId && x.UserId == userId);
            var note = await noteRepository.FirstOrDefaultAsync(x => x.Id == parsedNoteId);
            var isCanAdd = (note.UserId != userId) && existUser == null;
            if (isCanAdd)
            {
                var refTypeNote = await this.noteRepository.FirstOrDefaultAsync(x => x.Id == parsedNoteId);
                var connectUser = new UserOnPrivateNotes()
                {
                    UserId = userId,
                    NoteId = parsedNoteId,
                    AccessTypeId = refTypeNote.RefTypeId
                };
                await usersOnPrivateNotesRepository.AddAsync(connectUser);
            }
        }


        public async Task LeaveNote(string noteId)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == Context.UserIdentifier);
            if (user != null && Guid.TryParse(noteId, out var parsedNoteId))
            {
                var users = await userOnNoteRepository.GetWhereAsync(x => x.UserId == user.Id);
                if(users.Any())
                {
                    await userOnNoteRepository.RemoveRangeAsync(users);
                }
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, noteId);
                await Clients.Group(noteId).SendAsync("updateOnlineUsers", noteId);
            }
        }

        public override Task OnConnectedAsync()
        {
            usersIdentifier_ConnectionId.TryAdd(Context.UserIdentifier, Context.ConnectionId);
            return base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            usersIdentifier_ConnectionId.TryRemove(Context.UserIdentifier, out var value);

            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == Context.UserIdentifier);
            if (user != null)
            {
                var connections = await userOnNoteRepository.GetWhereAsync(x => x.UserId == user.Id);
                if(connections.Any())
                {
                    await userOnNoteRepository.RemoveRangeAsync(connections);
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
