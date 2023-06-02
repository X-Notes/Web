using Common.DatabaseModels;
using Dapper;
using System.Data;

namespace Noots.DatabaseContext.Dapper;

public class DapperRepository<T, IdType> : IDapperRepository<T, IdType> where T : BaseEntity<IdType> where IdType : struct, IDisposable
{
    private readonly DapperContext _dbContext;

    private readonly string tableName;

    private readonly string scheme;

    private IDbConnection _connection;

    public DapperRepository(DapperContext dbContext, string tableName, string scheme = "dbo")
    {
        _dbContext = dbContext;
        this.tableName = tableName;
        this.scheme = scheme;
        _connection = _dbContext.GetConnection();
    }

    private string Table => scheme + "." + tableName;

    private IDbConnection Connection => _connection;

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        string query = $"SELECT * FROM {Table}";
        return await Connection.QueryAsync<T>(query);
    }

    public async Task<T> GetByIdAsync(int id)
    {
        string query = $"SELECT * FROM {Table} WHERE Id = @Id";
        return await Connection.QueryFirstOrDefaultAsync<T>(query, new { Id = id });
    }

    public async Task<bool> DeleteAsync(int id)
    {
        string query = $"DELETE FROM {Table} WHERE Id = @Id";
        int affectedRows = await Connection.ExecuteAsync(query, new { Id = id });
        return affectedRows > 0;
    }

    public async Task<bool> DeleteAsync(IEnumerable<IdType> ids)
    {
        if (ids == null || !ids.Any())
            return false;

        string query = $"DELETE FROM {Table} WHERE Id IN @Ids";
        int affectedRows = await Connection.ExecuteAsync(query, new { Ids = ids });
        return affectedRows == ids.Count();
    }

    public void Dispose()
    {
        _connection.Dispose();
        GC.SuppressFinalize(this);
    }

}
