using Noots.BusinessLogic.Interfaces;
using Noots.DataAccess.Entities;
using Noots.DataAccess.InterfacesRepositories;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository userRepository = null;
        public UserService(IUserRepository userRepository)
        {
            this.userRepository = userRepository;
        }

        public async Task Add(User user)
        {
            await userRepository.Add(user);
        }

        public async Task<User> Get(int id)
        {
            return await userRepository.Get(id);
        }
    }
}
