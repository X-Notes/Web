using Common;
using Microsoft.AspNetCore.SignalR;

namespace Noots.SignalrUpdater.Impl
{
    public class IdProvider : IUserIdProvider
    {
        public virtual string GetUserId(HubConnectionContext connection)
        {
            return connection.User.Claims.FirstOrDefault(x => x.Type == ConstClaims.UserId)?.Value;
        }
    }
}
