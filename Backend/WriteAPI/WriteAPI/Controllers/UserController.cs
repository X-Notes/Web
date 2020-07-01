using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
        private readonly IIdGenerator idGenerator;
        public UserController(CommandsPushQueue commandsPushQueue, IIdGenerator idGenerator)
        {
            this.commandsPushQueue = commandsPushQueue;
            this.idGenerator = idGenerator;
        }

        [HttpPost]
        public void Authorize([FromBody]NewUser user)
        {
            user.Id = idGenerator.New();
            var command = new CommandGet();
            command.Type = typeof(NewUser).AssemblyQualifiedName;
            command.Data = user;
            var serialized = JsonConvert.SerializeObject(command);
            commandsPushQueue.CommandNewUser(serialized);
        }

        [HttpPut("main")]
        public void UpdateMainInformation([FromBody]UpdateMainUserInfo info)
        {
            var command = new CommandGet();
            command.Type = typeof(UpdateMainUserInfo).AssemblyQualifiedName;
            command.Data = info;
            var serialized = JsonConvert.SerializeObject(command);
            commandsPushQueue.CommandNewUser(serialized);
        }
    }
}