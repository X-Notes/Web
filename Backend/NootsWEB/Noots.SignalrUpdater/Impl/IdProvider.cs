using Common;
using Microsoft.AspNetCore.SignalR;

namespace Noots.SignalrUpdater.Impl;

public class IdProvider : IUserIdProvider
{
    public virtual string GetUserId(HubConnectionContext connection)
    {
        var userId = connection.User.Claims.FirstOrDefault(x => x.Type == ConstClaims.UserId)?.Value;

        if(userId == null)
        {
            throw new Exception("User Id cannot be null");
        }

        return userId;
    }
}
