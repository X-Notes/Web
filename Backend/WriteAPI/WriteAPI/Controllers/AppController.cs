using Common.DatabaseModels.models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace WriteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppController : ControllerBase
    {
        private readonly AppRepository appRepository;
        public AppController(AppRepository appRepository)
        {
            this.appRepository = appRepository;
        }

        [HttpGet("languages")]
        public async Task<List<Language>> GetLanguages()
        {
            return await this.appRepository.GetLanguages();
        }
    }
}
