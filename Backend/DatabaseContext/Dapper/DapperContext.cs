using System.Data;
using Npgsql;

namespace DatabaseContext.Dapper;

public class DapperContext
{
    private readonly string connection;

    public DapperContext(string connection)
    {
        this.connection = connection;
    }

    public IDbConnection GetConnection() => new NpgsqlConnection(connection);
}
