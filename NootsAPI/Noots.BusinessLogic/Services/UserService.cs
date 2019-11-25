using AutoMapper;
using MongoDB.Bson;
using Noots.BusinessLogic.Interfaces;
using Noots.DataAccess.InterfacesRepositories;
using Noots.Domain.DTO.User;
using Noots.Domain.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository userRepository = null;
        private readonly IMapper mapper;
        public UserService(IUserRepository userRepository, IMapper mapper)
        {
            this.userRepository = userRepository;
            this.mapper = mapper;
        }

        public async Task Add(DTOUser user)
        {
            var bduser = mapper.Map<User>(user);
            await userRepository.Add(bduser);
        }

        public async Task<DTOUser> Get(ObjectId id)
        {
            var user  = await userRepository.Get(id);
            var bduser = mapper.Map<DTOUser>(user);
            return bduser;
        }
        public async Task<DTOUser> GetByEmail(string email)
        {
            var user = await userRepository.GetByEmail(email);
            var bduser = mapper.Map<DTOUser>(user);
            return bduser;
        }
    }
}
