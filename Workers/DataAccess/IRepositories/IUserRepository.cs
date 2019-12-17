
using MongoDB.Bson;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.IRepositories
{
    public interface IUserRepository
    {
        Task Add(User user);
        Task<User> Get(ObjectId id);
        Task<User> GetByEmail(string email);
    }
}
