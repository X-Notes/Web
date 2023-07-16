using Common.DatabaseModels;
using Common.DatabaseModels.Models.Security;
using Common.DatabaseModels.Models.Users;
using Dapper;
using System.Data;

namespace Noots.DatabaseContext.Dapper.Reps;

public class DapperRefreshTokenRepository : IDisposable
{
    private readonly DapperContext dapperContext;

    private IDbConnection _connection;

    private IDbConnection Connection => _connection;

    public DapperRefreshTokenRepository(DapperContext dapperContext)
    {
        this.dapperContext = dapperContext;
        _connection = this.dapperContext.GetConnection();
    }

    public async Task<RefreshToken> GetRefreshToken(Guid userId, string refreshToken)
    {
        string query = $"SELECT * FROM {SchemeConfig.Security}.\"{nameof(RefreshToken)}\" " +
            $"WHERE \"{nameof(RefreshToken.UserId)}\" = @userId" +
            $" AND \"{nameof(RefreshToken.TokenString)}\" = @refreshToken";

        return await Connection.QueryFirstOrDefaultAsync<RefreshToken>(query, new { userId = userId, refreshToken = refreshToken });
    }

    public Task<int> SoftLockTokenAsync(Guid userId, string refreshToken)
    {
        string query = $"UPDATE {SchemeConfig.Security}.\"{nameof(RefreshToken)}\" SET \"{nameof(RefreshToken.IsProcessing)}\" = true" +
            $" WHERE \"{nameof(RefreshToken.UserId)}\" = @userId" +
            $" AND \"{nameof(RefreshToken.TokenString)}\" = @refreshToken";

        return Connection.ExecuteAsync(query, new { userId = userId, refreshToken = refreshToken });
    }

    public Task<int> RemoveTokenAsync(Guid userId, string refreshToken)
    {
        string query = $"DELETE FROM {SchemeConfig.Security}.\"{nameof(RefreshToken)}\"" +
            $" WHERE \"{nameof(RefreshToken.UserId)}\" = @userId" +
            $" AND \"{nameof(RefreshToken.TokenString)}\" = @refreshToken";

        return Connection.ExecuteAsync(query, new { userId = userId, refreshToken = refreshToken });
    }

    public void Dispose()
    {
        _connection.Dispose();
        GC.SuppressFinalize(this);
    }
}
