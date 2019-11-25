using DataAccess.IRepositories;
using DataAccess.Mongo;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataAccess.Repositories
{
    public class NootRepository : INootRepository
    {
        private readonly DbContext _context = null;

        public NootRepository(string connection, string database)
        {
            _context = new DbContext(connection, database);
        }
    }
}
