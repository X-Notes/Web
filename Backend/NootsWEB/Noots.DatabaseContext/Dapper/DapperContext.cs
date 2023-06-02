using Npgsql;
using System.Data;

namespace Noots.DatabaseContext.Dapper;

public class DapperContext
{
    private readonly string connection;

    public DapperContext(string connection)
    {
        this.connection = connection;
    }

    public IDbConnection GetConnection() => new NpgsqlConnection(connection);
}
