using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Users;
using Common.Filters;

namespace FakeData.Api;

[Route("api/[controller]")]
[ApiController]
[ServiceFilter(typeof(DisableInProductionFilter))]
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