using MongoDB.Bson;
using MongoDB.Driver;
using Noots.DataAccess.Context;
using Shared.Mongo;
using Shared.Mongo.Parts;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.DataAccess.Repositories
{
    public class PartCommonListRepository
    {
        private readonly DbContext _context = null;
        public PartCommonListRepository(string connection, string database)
        {
            _context = new DbContext(connection, database);
        }
        public async Task New(ObjectId noteId, List<Part> parts)
        {
            var filter = new BsonDocument("_id", noteId);
            var update = Builders<Note>.Update.Set("Parts", parts);
            var options = new FindOneAndUpdateOptions<Note> { };
            await _context.Notes.FindOneAndUpdateAsync(filter, update, options);
        }
    }
}
