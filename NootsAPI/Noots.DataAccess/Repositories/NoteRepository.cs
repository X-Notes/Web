using Noots.DataAccess.Context;
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
    }
}
