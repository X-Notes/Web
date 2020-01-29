using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
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
        private readonly QueueService queueService;
        public UserController(UserService userService, QueueService queueService)
        {
            this.userService = userService;
            this.queueService = queueService;
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
    }
}
