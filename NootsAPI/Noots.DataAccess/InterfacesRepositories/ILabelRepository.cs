using MongoDB.Bson;
using Noots.Domain.DTO.Label;
using Noots.Domain.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.DataAccess.InterfacesRepositories
{
    public interface ILabelRepository
    {
        Task<ObjectId> Add(Label newLabel);
        Task<List<Label>> GetLabelsByUserId(ObjectId objectId);
    }
}
