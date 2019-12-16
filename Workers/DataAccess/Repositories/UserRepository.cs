using DataAccess.IRepositories;
using DataAccess.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly DbContext _context = null;

        public UserRepository(string connection, string database)
        {
            _context = new DbContext(connection, database);
        }

        public async Task Add(User user)
        {
            await _context.Users.InsertOneAsync(user);
        }
        public async Task<User> Get(ObjectId id)
        {
            return await _context.Users.Find(x => x.Id == id).FirstOrDefaultAsync();
        }
        public async Task<User> GetByEmail(string email)
        {
            return await _context.Users.Find(x => x.Email == email).FirstOrDefaultAsync();
        }
    }
}
