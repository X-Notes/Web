using MongoDB.Bson;
using Noots.DataAccess.Repositories;
using Shared.DTO.PartCommonList;
using Shared.Mongo.Parts;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Services
{
    public class PartCommonListService
    {
        private readonly PartCommonListRepository commonListRepository;
        private readonly NoteRepository noteRepository;
        public PartCommonListService(PartCommonListRepository commonListRepository, NoteRepository noteRepository)
        {
            this.commonListRepository = commonListRepository;
            this.noteRepository = noteRepository;
        }

        public async Task New(DTONewPartCommonList partCommonList)
        {
            if (ObjectId.TryParse(partCommonList.NoteId, out var dbId))
            {
                var note = await noteRepository.GetById(dbId);
                var parts = note.Parts;
                var order = parts.Count;
                var newPart = new CommonList()
                {
                    Id = ObjectId.GenerateNewId(),
                    Description = partCommonList.Text,
                    Order = ++order,
                    Type = "CommonList"
                };
                parts.Add(newPart);
                await commonListRepository.New(dbId, parts);
            }
        }
    }
}
