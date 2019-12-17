using DataAccess.IRepositories;
using DataAccess.Mongo;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Repositories
{
    public class NootRepository : INootRepository
    {
        private readonly DbContext _context = null;

        public NootRepository(string connection, string database)
        {
            _context = new DbContext(connection, database);
        }
        public async Task<MongoNoot> Add(MongoNoot noot)
        {;
            await _context.Noots.InsertOneAsync(noot);
            Console.WriteLine(noot.Id);
            return noot;
        }
    }
}
