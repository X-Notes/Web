using MongoDB.Bson;
using Noots.DataAccess.Repositories;
using Shared.DTO.PartText;
using Shared.Mongo.Parts;
using System;
using System.Collections.Generic;
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

        public async Task New(DTONewPartText partText)
        {
            if (ObjectId.TryParse(partText.NoteId, out var dbId))
            {
                var note = await noteRepository.GetById(dbId);
                var parts = note.Parts;
                var order = parts.Count;
                var newPart = new Text()
                {
                    Description = partText.Text,
                    Order = ++order,
                    Type = "Text"
                };
                parts.Add(newPart);
                await partTextRepository.New(dbId, parts);
            }
        }
    }
}
