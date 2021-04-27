using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;

namespace BI.signalR
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
