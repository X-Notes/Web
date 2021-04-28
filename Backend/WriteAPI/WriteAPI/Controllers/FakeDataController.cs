using Common.DatabaseModels.models.Users;
using FakeData;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WriteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FakeDataController : ControllerBase
    {
        private readonly UserGenerator userGenerator;
        private readonly DatabaseFakeDataBridge databaseFakeDataBridge;
        public FakeDataController(UserGenerator userGenerator, DatabaseFakeDataBridge databaseFakeDataBridge)
        {
            this.userGenerator = userGenerator;
            this.databaseFakeDataBridge = databaseFakeDataBridge;
        }

        [HttpGet("get/users/{count}")]
        public List<User> GetUsers(int count)
        {
            return userGenerator.GetUsers(count);
        }

        [HttpGet("set/users/{count}")]
        public async Task<IActionResult> SetUsers(int count)
        {
            await databaseFakeDataBridge.SetUsers(count);
            return Ok("ok");
        }

    }
}
