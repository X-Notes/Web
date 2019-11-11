using Noots.DataAccess.Entities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Interfaces
{
    public interface IUserService
    {
        Task Add(User user);
        Task<User> Get(int id);
    }
}
