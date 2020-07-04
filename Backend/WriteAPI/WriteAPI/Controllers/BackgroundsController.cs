using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BackgroundsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public BackgroundsController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpGet("background/default")]
        public async Task DefaultBackgroundCover()
        {

        }

        [HttpDelete("background/{id}")]
        public async Task DeleteBackground(int id)
        {

        }

        [HttpGet("background/{id}")]
        public async Task UpdateBackgroundCover(int id)
        {
            var currentUserEmail = this.GetUserEmail();
        }

        [HttpPost("background")]
        public async Task<int> NewBackgroundPhoto(IFormFile photo)
        {
            var currentUserEmail = this.GetUserEmail();
            return 0;
        }
    }
}