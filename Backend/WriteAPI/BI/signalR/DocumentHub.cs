using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace BI.signalR
{
    public class DocumentHub : Hub
    {
        public DocumentHub()
        {

        }
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task JoinNote(string noteId)
        {
            Console.WriteLine(new string('-', 30));
            Console.WriteLine("Join");         
            Console.WriteLine(Context.ConnectionId);
            Console.WriteLine(noteId);
            Console.WriteLine(Context.UserIdentifier);
            Console.WriteLine();
            
            await Groups.AddToGroupAsync(Context.ConnectionId, noteId);
        }

        public async Task LeaveNote(string noteId)
        {
            Console.WriteLine(new string('-', 30));
            Console.WriteLine("Leave");           
            Console.WriteLine(Context.ConnectionId);
            Console.WriteLine(noteId);
            Console.WriteLine(Context.UserIdentifier);
            Console.WriteLine();

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, noteId);
        }
    }
}
