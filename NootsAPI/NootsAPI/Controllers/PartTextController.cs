using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Noots.BusinessLogic.Services;
using Shared.DTO.PartText;

namespace NootsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartTextController : ControllerBase
    {
        private readonly PartTextService partTextService;
        public PartTextController(PartTextService partTextService)
        {
            this.partTextService = partTextService;
        }

        [HttpPost("new")]
        public async Task<string> New(DTONewPartText partText)
        {
            return await partTextService.New(partText);
        }
        
    }
}