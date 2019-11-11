using Noots.DataAccess.Entities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.DataAccess.InterfacesRepositories
{
    public interface IUserRepository
    {
        Task Add(User user);
        Task<User> Get(int id);
    }
}
