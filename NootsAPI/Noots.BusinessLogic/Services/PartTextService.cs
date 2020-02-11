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
                var newPart = new Text()
                {
                    Id = ObjectId.GenerateNewId(),
                    Description = partText.Text,
                    Type = "text"
                };
                parts.Add(newPart);
                await partTextRepository.New(dbId, parts);
            }
        }

        public async Task<string> NewUnknown(PartNewUnknown partUnknown)
        {
            if (ObjectId.TryParse(partUnknown.NoteId, out var dbId))
            {
                var note = await noteRepository.GetById(dbId);
                var parts = note.Parts;
                var newId = ObjectId.GenerateNewId();
                var newPart = new Unknown()
                {
                    Id = newId,
                    Type = "unknown"
                };
                parts.Insert(partUnknown.Index, newPart);
                await partTextRepository.New(dbId, parts);
                return newId.ToString();
            }
            return null;
        }

        public async Task DeleteUnknown(DeletePartUnknown part)
        {
            if (ObjectId.TryParse(part.NoteId, out var dbId) && ObjectId.TryParse(part.PartId, out var partId))
            {
                var note = await noteRepository.GetById(dbId);
                var parts = note.Parts;
                var item = parts.FirstOrDefault(x => x.Id == partId);
                if (item == null)
                {
                    return;
                }
                parts.Remove(item);
                await partTextRepository.New(dbId, parts);
            }
        }
        
    }
}
