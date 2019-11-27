using MongoDB.Bson;
using MongoDB.Driver;
using Noots.DataAccess.Context;
using Noots.DataAccess.InterfacesRepositories;
using Noots.Domain.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.DataAccess.Repositories
{
    public class NootRepository : INootRepository
    {
        private readonly DbContext _context = null;

        public NootRepository(string connection, string database)
        {
            _context = new DbContext(connection, database);
        }

        public async Task<MongoNoot> GetFullNoot(ObjectId id)
        {
            return await _context.Noots.Find(x => x.Id == id).FirstOrDefaultAsync();
        }
    }
}
