using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Commands;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using WriteAPI.Services;

namespace WriteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {

        private readonly CommandsPushQueue commandsPushQueue;
        public UserController(CommandsPushQueue commandsPushQueue)
        {
            this.commandsPushQueue = commandsPushQueue;
        }

        [HttpPost]
        public void Authorize([FromBody]NewUserCommand user)
        {
            string output = JsonConvert.SerializeObject(user);
            commandsPushQueue.CommandNewUser(output);
        }
    }
}