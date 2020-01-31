using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Noots.BusinessLogic.Services;
using NootsAPI.Infastructure;
using Shared.DTO.User;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace NootsAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private readonly UserService userService;

        public UserController(UserService userService)
        {
            this.userService = userService;
        }

        [HttpGet]
        public async Task<DTOUser> Get()
        {
            var currentUserEmail = this.GetUserEmail();
            var user = await this.userService.GetByEmail(currentUserEmail);
            return user;
        }


        [HttpPost]
        public async Task<DTOUser> Authorize([FromBody]DTOUser user)
        {
            var currentUserEmail = this.GetUserEmail();
            await this.userService.Add(user);
            var dbuser = await userService.GetByEmail(currentUserEmail);
            return dbuser;
        }


        [HttpGet("full")]
        public async Task<DTOFullUser> GetFullUser()
        {
            var currentUserEmail = this.GetUserEmail();
            var user = await this.userService.GetFullByEmail(currentUserEmail);
            return user;
        }
        [HttpPost("photo")]
        public async Task<string> ChangeProfilePhoto(IFormFile photo)
        {
            var currentUserEmail = this.GetUserEmail();
            return await userService.ChangeProfilePhoto(photo, currentUserEmail);
        }

        [HttpPost("background")]
        public async Task<DTOBackground> NewBackgroundPhoto(IFormFile photo)
        {
            var currentUserEmail = this.GetUserEmail();
            return await userService.NewBackgroundPhoto(photo, currentUserEmail);
        }

        [HttpDelete("background/{id}")]
        public async Task DeleteBackground(int id)
        {
            var currentUserEmail = this.GetUserEmail();
            await userService.DeleteBackground(currentUserEmail, id);
        }
    }
}
