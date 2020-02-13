using MongoDB.Bson;
using Noots.DataAccess.Repositories;
using Shared.DTO.PartText;
using Shared.Mongo.Parts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Services
{
    public class PartTextService
    {
        private readonly PartTextRepository partTextRepository;
        private readonly NoteRepository noteRepository;
        public PartTextService(PartTextRepository partTextRepository, NoteRepository noteRepository)
        {
            this.partTextRepository = partTextRepository;
            this.noteRepository = noteRepository;
        }

        public async Task<string> New(DTONewPartText partText)
        {
            if (ObjectId.TryParse(partText.NoteId, out var dbId))
            {
                var note = await noteRepository.GetById(dbId);
                var parts = note.Parts;
                var id = ObjectId.GenerateNewId();
                var newPart = new Text()
                {
                    Id = id,
                    Description = partText.Text,
                    Type = "text"
                };
                parts[partText.Order] = newPart;
                await partTextRepository.New(dbId, parts);
                return id.ToString();
            }
            return null;
        }

        
    }
}
