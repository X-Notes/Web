using Noots.DataAccess.InterfacesRepositories;
using Noots.DataAccess.Context;
using System;
using System.Collections.Generic;
using System.Text;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Threading.Tasks;
using Shared.Mongo;

namespace Noots.DataAccess.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly DbContext _context = null;

        public UserRepository(string connection,string database)
        {
            Console.WriteLine(connection);
            _context = new DbContext(connection,database);
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
