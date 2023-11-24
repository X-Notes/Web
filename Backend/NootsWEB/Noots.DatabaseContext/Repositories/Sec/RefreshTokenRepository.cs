using Common.DatabaseModels.Models.Security;
using DatabaseContext.GenericRepositories;
using Microsoft.Extensions.Logging;

namespace DatabaseContext.Repositories.Sec;

public class RefreshTokenRepository : Repository<RefreshToken, int>
{
    private readonly ILogger<RefreshTokenRepository> logger;

    public RefreshTokenRepository(NootsDBContext context, ILogger<RefreshTokenRepository> logger) : base(context)
    {
        this.logger = logger;
    }

    public async Task<RefreshToken> GetTokenAsync(Guid userId, string refreshToken)
    {
        return await FirstOrDefaultAsync(x => x.UserId == userId && x.TokenString == refreshToken);
    }
}
