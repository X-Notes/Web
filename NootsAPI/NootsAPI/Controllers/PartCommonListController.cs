using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Noots.BusinessLogic.Services;
using Shared.DTO.PartCommonList;

namespace NootsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartCommonListController : ControllerBase
    {
        private readonly PartCommonListService commonListService;

        public PartCommonListController(PartCommonListService commonListService)
        {
            this.commonListService = commonListService;
        }


        [HttpPost("new")]
        public async Task New(DTONewPartCommonList partCommonList)
        {
            await commonListService.New(partCommonList);
        }
    }
}