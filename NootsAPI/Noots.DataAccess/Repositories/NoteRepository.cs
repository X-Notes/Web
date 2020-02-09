using MongoDB.Bson;
using MongoDB.Driver;
using Noots.DataAccess.Context;
using Shared.DTO.Note;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.DataAccess.Repositories
{
    public class NoteRepository
    {
        private readonly DbContext _context = null;
        public NoteRepository(string connection, string database)
        {
            _context = new DbContext(connection, database);
        }

        public async Task<Note> New(Note note)
        {
            await _context.Notes.InsertOneAsync(note);
            return note;
        }
        public async Task<List<Note>> GetAll(string email)
        {
            return await _context.Notes.Find(x => x.Email == email).ToListAsync();
        }
        public async Task UpdateTitle(UpdateTitle updateTitle)
        {
            if (ObjectId.TryParse(updateTitle.Id, out var dbId))
            {
                var filter = new BsonDocument("_id", dbId);
                var update = Builders<Note>.Update
                    .Set("Title", updateTitle.Title);
                var options = new FindOneAndUpdateOptions<Note>
                {
                };
                await _context.Notes.FindOneAndUpdateAsync(filter, update, options);
            }
        }
        public async Task<Note> GetById(ObjectId id)
        {
            return await _context.Notes.Find(x => x.Id == id).FirstAsync();
        }
    }
}
