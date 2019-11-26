using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Noots.BusinessLogic.Interfaces;
using Noots.Domain.Elastic;

namespace NootsAPI.Controllers
{

    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NootsController : ControllerBase
    {
        private readonly INootService nootService;
        public NootsController(INootService nootService)
        {
            this.nootService = nootService;
        }

        [HttpGet("all")]
        public async Task<IEnumerable<ElasticNoot>> GetAllNoots()
        {
            return await nootService.GetAllNoots();
        }
    }
}