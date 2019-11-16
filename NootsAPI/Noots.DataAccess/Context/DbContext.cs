using MongoDB.Driver;
using Noots.DataAccess.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Noots.DataAccess.Context
{
    public class DbContext
    {
        private readonly IMongoDatabase _database = null;
        public DbContext(string connection, string database)
        {
            var client = new MongoClient(connection);
            if (client != null)
                _database = client.GetDatabase(database);
        }
        public IMongoCollection<User> Users
        {
            get
            {
                return _database.GetCollection<User>("users");
            }
        }
    }
}
