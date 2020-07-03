using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Domain.Commands;
using Domain.Ids;
using Domain.Models;
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
        public void Authorize([FromBody]NewUser user)
        {
            var str = FactoryQueueCommand.Transform(user);
            commandsPushQueue.CommandNewUser(str);
        }

        [HttpPut("main")]
        public void UpdateMainInformation([FromBody]UpdateMainUserInfo info)
        {
            var str = FactoryQueueCommand.Transform(info);
            commandsPushQueue.CommandNewUser(str);
        }
    }
}