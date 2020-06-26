using MongoDB.Bson;
using Noots.DataAccess.Repositories;
using Shared.DTO.Note;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Services
{
    public class FullNoteService
    {
        private readonly NoteRepository noteRepository;
        public FullNoteService(NoteRepository noteRepository)
        {
            this.noteRepository = noteRepository;
        }

        public async Task UpdateDescription(UpdateFullNoteDescription description)
        {
            if (ObjectId.TryParse(description.Id, out var Id))
            {
                await this.noteRepository.UpdateDescription(Id, description.InnerHTML);
            }
        }
    }
}
