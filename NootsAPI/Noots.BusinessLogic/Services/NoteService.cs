using Noots.DataAccess.Repositories;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Services
{
    public class NoteService
    {
        private readonly NoteRepository noteRepository;

        public NoteService(NoteRepository noteRepository)
        {
            this.noteRepository = noteRepository;
        }

        public async Task<string> NewNote()
        {
            var newNote = await noteRepository.New(new Note());
            return newNote.Id.ToString();
        }
    }
}
