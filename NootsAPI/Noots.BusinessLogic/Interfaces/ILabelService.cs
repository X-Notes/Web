using MongoDB.Bson;
using Shared.DTO.Label;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Interfaces
{
    public interface ILabelService
    {
        Task<string> Add(NewLabel newLabel,string email);
        Task<List<LabelDTO>> GetLabelsByUserId(string email);
        Task Update(LabelDTO label);
        Task Delete(string id);
        Task<LabelDTO> GetById(string id);
    }
}
