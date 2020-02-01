using AutoMapper;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using Noots.DataAccess.Repositories;
using Shared.DTO.User;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Linq;
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
            bduser.BackgroundsId = new List<Background>();
            await userRepository.Add(bduser);
        }
        public async Task<DTOUser> GetByEmail(string email)
        {
            var user = await userRepository.GetByEmail(email);
            var bduser = mapper.Map<DTOUser>(user);
            return bduser;
        }
        public async Task<DTOFullUser> GetFullByEmail(string email)
        {
            var user = await userRepository.GetByEmail(email);
            user.BackgroundsId = user.BackgroundsId.OrderBy(x => x.Id).ToList();
            var bduser = mapper.Map<DTOFullUser>(user);
            return bduser;
        }
        public async Task<string> ChangeProfilePhoto(IFormFile photo, string email)
        {
            var base64 = await this.photoHandler.GetBase64(photo);
            await userRepository.UpdateProfilePhoto(email, base64);
            return base64;
        }
        public async Task<DTOBackground> NewBackgroundPhoto(IFormFile photo, string email)
        {
            var user = await userRepository.GetByEmail(email);
            var base64 = await this.photoHandler.GetBase64(photo);
            var userBackgrounds = user.BackgroundsId;

            int key = 0;

            if (userBackgrounds.Count > 0)
            {
                key = userBackgrounds.Select(x => x.Id).Max();
            }
            var newBackground = new Background()
            {
                BackgroundId = base64,
                Id = ++key
            };

            userBackgrounds.Add(newBackground);
            await userRepository.UpdateBackgrounds(email, userBackgrounds, newBackground);

            return mapper.Map<DTOBackground>(newBackground);
        }
        public async Task DeleteBackground(string email, int id)
        {
            var user = await userRepository.GetByEmail(email);
            var userBackgrounds = user.BackgroundsId;

            var background = userBackgrounds.FirstOrDefault(x => x.Id == id);
            userBackgrounds.Remove(background);

            if (userBackgrounds.Count != 0)
            {
                background = userBackgrounds.Last();
            }
            else
            {
                background = null;
            }

            await userRepository.UpdateBackgrounds(email, userBackgrounds, background);
        }
        public async Task UpdateBackgroundCover(string email, int id)
        {
            var user = await userRepository.GetByEmail(email);
            var userBackgrounds = user.BackgroundsId;
            var background = userBackgrounds.FirstOrDefault(x => x.Id == id);
            await userRepository.UpdateBackgrounds(email, userBackgrounds, background);
        }
    }
}
