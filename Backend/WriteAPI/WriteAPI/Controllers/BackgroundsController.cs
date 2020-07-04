using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Commands.backgrounds;
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
            var email = this.GetUserEmail();
            await _mediator.Send(new DefaultBackground(email));
        }

        [HttpDelete("background/{id}")]
        public async Task DeleteBackground(int id)
        {
            var email = this.GetUserEmail();
            await _mediator.Send(new RemoveBackground(email, id));
        }

        [HttpGet("background/{id}")]
        public async Task UpdateBackgroundCover(int id)
        {
            var email = this.GetUserEmail();
            await _mediator.Send(new UpdateBackground(email, id));
        }

        [HttpPost("background")]
        public async Task NewBackgroundPhoto(IFormFile photo)
        {
            var email = this.GetUserEmail();
            await _mediator.Send(new NewBackground(email, photo));
        }
    }
}