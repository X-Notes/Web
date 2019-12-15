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
    }
}
