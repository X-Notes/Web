using MongoDB.Bson;
using MongoDB.Driver;
using Noots.DataAccess.Context;
using Noots.DataAccess.InterfacesRepositories;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.DataAccess.Repositories
{
    public class LabelRepository : ILabelRepository
    {
        private readonly DbContext _context = null;
        public LabelRepository(string connection, string database)
        {
            _context = new DbContext(connection, database);
        }

        public async Task<ObjectId> Add(Label newLabel)
        {
            await _context.Labels.InsertOneAsync(newLabel);
            return newLabel.Id;
        }
        public async Task<List<Label>> GetLabelsByUserId(ObjectId objectId)
        {
           return await _context.Labels.Find(x => x.UserId == objectId).ToListAsync();
        }
        public async Task Update(Label label)
        {
            var filter = new BsonDocument("_id", label.Id);
            var update = Builders<Label>.Update
                .Set("Color", label.Color)
                .Set("Name", label.Name);
            var options = new FindOneAndUpdateOptions<Label>
            {
            };
            await _context.Labels.FindOneAndUpdateAsync(filter, update, options);
        }
        public async Task Delete(ObjectId id)
        {
            var filter = new BsonDocument("_id", id);
            await _context.Labels.DeleteOneAsync(filter);
        }
        public async Task<Label> GetLabelById(ObjectId id)
        {
            return await _context.Labels.Find(x => x.Id == id).FirstAsync();
        }
    }
}
