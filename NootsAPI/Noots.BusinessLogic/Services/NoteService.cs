using AutoMapper;
using MongoDB.Bson;
using Noots.DataAccess.Repositories;
using Shared.DTO.Note;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Linq;
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
            var dbNotes = await noteRepository.GetAll(Email);

            int order = 0;
            if(dbNotes.Count != 0)
            {
                order = dbNotes.Max(x => x.Order);
                ++order;
            }
            var newNote = await noteRepository.New(new Note() { Email = Email, Order = order }) ;
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
        public async Task<DTOFullNote> GetById(string id)
        {
            if (ObjectId.TryParse(id, out var Id))
            {
                var dbnote = await noteRepository.GetById(Id);
                var note = mapper.Map<DTOFullNote>(dbnote);
                return note;
            }
            return null;
        }
    }
}
