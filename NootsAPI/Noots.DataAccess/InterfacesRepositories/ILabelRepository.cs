using MongoDB.Bson;
using Shared.Mongo;
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
        Task Update(Label label);
        Task Delete(ObjectId id);
        Task<Label> GetLabelById(ObjectId id);
    }
}
