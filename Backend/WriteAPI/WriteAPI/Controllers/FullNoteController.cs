using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Commands.noteInner;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FullNoteController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FullNoteController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpPatch("title")]
        public async Task ChangeColor([FromBody]UpdateTitleCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }
    }

}