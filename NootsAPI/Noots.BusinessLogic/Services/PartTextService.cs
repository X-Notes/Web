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
        private readonly PartsRepository partTextRepository;
        private readonly NoteRepository noteRepository;
        public PartTextService(PartsRepository partTextRepository, NoteRepository noteRepository)
        {
            this.partTextRepository = partTextRepository;
            this.noteRepository = noteRepository;
        }

        public async Task<string> New(NewTextLine line)
        {
            if (ObjectId.TryParse(line.NoteId, out var dbId))
            {
                var note = await noteRepository.GetById(dbId);
                var parts = note.Parts;
                var id = ObjectId.GenerateNewId();
                var newPart = new Text()
                {
                    Id = id,
                    Type = "text"
                };
                parts.Insert(line.Order, newPart);
                await partTextRepository.Update(dbId, parts);
                return id.ToString();
            }
            throw new Exception();
        }
        public async Task Update(UpdateText text)
        {
            if (ObjectId.TryParse(text.NoteId, out var dbId) && ObjectId.TryParse(text.PartId, out var partId))
            {
                var note = await noteRepository.GetById(dbId);
                var parts = note.Parts;
                var partText = parts.FirstOrDefault(x => x.Id == partId);
                var cast = partText as Text;
                cast.Description = text.Description;
                await partTextRepository.Update(dbId, parts);
            }
         }
        
    }
}
