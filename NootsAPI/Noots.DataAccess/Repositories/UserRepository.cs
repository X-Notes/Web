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
    public class UserRepository
    {
        private readonly DbContext _context = null;

        public UserRepository(string connection,string database)
        {
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
        public async Task UpdateProfilePhoto(string email, string photoId)
        {
            var filter = new BsonDocument("Email", email);
            var update = Builders<User>.Update
                .Set("PhotoId", photoId);
            var options = new FindOneAndUpdateOptions<User>{};
            await _context.Users.FindOneAndUpdateAsync(filter, update, options);
        }
        public async Task UpdateBackgrounds(string email, List<Background> backgrounds, Background currentBackGround)
        {
            var filter = new BsonDocument("Email", email);
            var update = Builders<User>.Update
                .Set("BackgroundsId", backgrounds)
                .Set("CurrentBackgroundId", currentBackGround);
            var options = new FindOneAndUpdateOptions<User> { };
            await _context.Users.FindOneAndUpdateAsync(filter, update, options);
        }
    }
}
