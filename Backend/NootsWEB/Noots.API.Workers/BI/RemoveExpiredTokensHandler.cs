using Common;
using Noots.DatabaseContext.Repositories.Sec;

namespace Noots.API.Workers.BI;

public class RemoveExpiredTokensHandler
{
    private readonly RefreshTokenRepository refreshTokenRepository;
    private readonly ILogger<RemoveExpiredTokensHandler> logger;

    public RemoveExpiredTokensHandler(RefreshTokenRepository refreshTokenRepository, ILogger<RemoveExpiredTokensHandler> logger)
    {
        this.refreshTokenRepository = refreshTokenRepository;
        this.logger = logger;
    }

    public async Task HandleAsync()
    {
        var nowTime = DateTimeProvider.Time;
        var expiredTokens = await refreshTokenRepository.GetWhereAsNoTrackingAsync(x => x.ExpireAt < nowTime);
        expiredTokens = expiredTokens.Take(500).ToList();
        if (!expiredTokens.Any()) return;
        try
        {
            await refreshTokenRepository.RemoveRangeAsync(expiredTokens);
        }
        catch (Exception e)
        {
            logger.LogError(e.ToString());
        }
    }
}
