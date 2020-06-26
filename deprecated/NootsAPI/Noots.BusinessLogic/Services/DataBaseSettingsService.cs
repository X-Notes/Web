using MongoDB.Driver;
using Noots.DataAccess.Context;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Services
{
    public class DataBaseSettingsService
    {
        private readonly DbContext _context = null;

        public DataBaseSettingsService(string connection, string database)
        {
            _context = new DbContext(connection, database);
        }

        public async Task<string> CreateIndexForUser()
        {
            var options = new CreateIndexOptions() { Unique = true };
            var field = new StringFieldDefinition<User>("Email");
            var indexDefinition = new IndexKeysDefinitionBuilder<User>().Ascending(field);

            var indexModel = new CreateIndexModel<User>(indexDefinition, options);
            await _context.Users.Indexes.CreateOneAsync(indexModel);

            return "success";
        }
        public async Task<string> CreateIndexForLabel()
        {
            var options = new CreateIndexOptions();
            var field = new StringFieldDefinition<Label>("UserId");
            var indexDefinition = new IndexKeysDefinitionBuilder<Label>().Ascending(field);

            var indexModel = new CreateIndexModel<Label>(indexDefinition, options);
            await _context.Labels.Indexes.CreateOneAsync(indexModel);

            return "success";
        }

        public async Task<string> CreateIndexForNote()
        {
            var options = new CreateIndexOptions();
            var field = new StringFieldDefinition<Note>("Email");
            var indexDefinition = new IndexKeysDefinitionBuilder<Note>().Ascending(field);

            var indexModel = new CreateIndexModel<Note>(indexDefinition, options);
            await _context.Notes.Indexes.CreateOneAsync(indexModel);

            return "success";
        }
    }
}
