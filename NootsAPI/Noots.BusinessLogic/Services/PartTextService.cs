using MongoDB.Bson;
using Noots.DataAccess.Repositories;
using Shared.DTO.PartText;
using Shared.Mongo.Parts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Shared.DTO.PartUnknown;

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
                    Id = ObjectId.GenerateNewId(),
                    Description = partText.Text,
                    Order = ++order,
                    Type = "text"
                };
                parts.Add(newPart);
                await partTextRepository.New(dbId, parts);
            }
        }

        public async Task NewUnknown(PartNewUnknown partUnknown)
        {
            if (ObjectId.TryParse(partUnknown.NoteId, out var dbId))
            {
                var note = await noteRepository.GetById(dbId);
                var parts = note.Parts;
                var order = parts.Count;
                var newPart = new Unknown()
                {
                    Id = ObjectId.GenerateNewId(),
                    Order = ++order,
                    Type = "unknown"
                };
                parts.Add(newPart);
                await partTextRepository.New(dbId, parts);
            }
        }

        public async Task DeleteUnknown(DeletePartUnknown part)
        {
            if (ObjectId.TryParse(part.NoteId, out var dbId) && ObjectId.TryParse(part.PartId, out var partId))
            {
                var note = await noteRepository.GetById(dbId);
                var parts = note.Parts;
                var item = parts.FirstOrDefault(x => x.Id == partId);
                parts.Remove(item);
                foreach (var temp in parts)
                {
                    if (temp.Order > item.Order)
                    {
                        ++temp.Order;
                    }
                }
                await partTextRepository.New(dbId, parts);
            }
        }
        
    }
}
