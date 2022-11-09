using Microsoft.AspNetCore.SignalR;
using Noots.DatabaseContext.Repositories.WS;

namespace Noots.SignalrUpdater.Impl;

public class BaseSignalRService
{
    protected readonly UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository;

    public IHubContext<AppSignalRHub> signalRContext;

    public BaseSignalRService(
        UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository,
        IHubContext<AppSignalRHub> context)
	{
        this.userIdentifierConnectionIdRepository = userIdentifierConnectionIdRepository;
        this.signalRContext = context;

    }

    public Task<List<string>> GetAuthorizedConnections(List<Guid> userIds, Guid exceptUserId)
    {
        return userIdentifierConnectionIdRepository.GetConnectionsAsync(userIds, exceptUserId);
    }

    public async Task<List<string>> GetAuthorizedConnections(Guid userId)
    {
        var connections = await userIdentifierConnectionIdRepository.GetWhereAsync(x => x.UserId == userId);
        return connections.Select(x => x.ConnectionId).ToList();
    }
}
