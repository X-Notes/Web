using AutoMapper;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using Noots.DataAccess.Repositories;
using Shared.DTO.User;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Services
{
    public class UserService
    {
        private readonly UserRepository userRepository = null;
        private readonly IMapper mapper;
        private readonly PhotoHandler photoHandler;
        public UserService(UserRepository userRepository, IMapper mapper, PhotoHandler photoHandler)
        {
            this.userRepository = userRepository;
            this.mapper = mapper;
            this.photoHandler = photoHandler;
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
        public async Task<string> ChangeProfilePhoto(IFormFile photo, string email)
        {
            var bytes = await this.photoHandler.GetBytesFromFile(photo);
            var base64 = Convert.ToBase64String(bytes);
            base64 = "data:image/png;base64," + base64;
            await userRepository.UpdateProfilePhoto(email, base64);
            return base64;
        }
    }
}
