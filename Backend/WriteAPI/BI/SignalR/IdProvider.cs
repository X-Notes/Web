using System;
using System.Linq;
using Microsoft.AspNetCore.SignalR;

namespace BI.SignalR
{
    public class IdProvider : IUserIdProvider
    {
        public virtual string GetUserId(HubConnectionContext connection)
        {
            return connection.User.Claims.FirstOrDefault(x => x.Type == "userId")?.Value;
        }
    }
}
