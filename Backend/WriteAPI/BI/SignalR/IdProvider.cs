using System;
using System.Linq;
using Microsoft.AspNetCore.SignalR;

namespace BI.SignalR
{
    public class IdProvider : IUserIdProvider
    {
        public virtual string GetUserId(HubConnectionContext connection)
        {
            var email = connection.User.Claims.FirstOrDefault(x => x.Type.Contains("emailaddress"))?.Value;
            if(string.IsNullOrEmpty(email))
            {
                throw new Exception("Invalid email for connection");
            }
            return email;
        }
    }
}
