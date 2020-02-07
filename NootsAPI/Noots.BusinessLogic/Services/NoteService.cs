using AutoMapper;
using Noots.DataAccess.Repositories;
using Shared.DTO.Note;
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
        private readonly IMapper mapper;
        public NoteService(NoteRepository noteRepository, IMapper mapper)
        {
            this.noteRepository = noteRepository;
            this.mapper = mapper;
        }

        public async Task<string> NewNote(string Email)
        {
            var newNote = await noteRepository.New(new Note() { Email = Email});
            return newNote.Id.ToString();
        }
        public async Task<List<DTONote>> GetAll(string email)
        {
            var dbNotes = await noteRepository.GetAll(email);
            var notes = mapper.Map<List<DTONote>>(dbNotes);
            return notes;
        }
        public async Task UpdateTitle(UpdateTitle updateTitle)
        {
           await noteRepository.UpdateTitle(updateTitle);
        }
    }
}
