using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Noots.BusinessLogic.Services;
using Noots.DataAccess.Context;
using Shared.Mongo;

namespace NootsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataBaseSettingsController : ControllerBase
    {
        private readonly DataBaseSettingsService settingsService;
        public DataBaseSettingsController(DataBaseSettingsService settingsService)
        {
            this.settingsService = settingsService;
        }

        [HttpGet("user")]
        public async Task<string> CreateIndexForUser()
        {
            return await settingsService.CreateIndexForUser();
        }
    }
}