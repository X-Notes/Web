using MongoDB.Bson;
using Shared.DTO.User;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Interfaces
{
    public interface IUserService
    {
        Task Add(DTOUser user);
        Task<DTOUser> Get(ObjectId id);
        Task<DTOUser> GetByEmail(string email);
    }
}
