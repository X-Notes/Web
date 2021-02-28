using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Commands.noteInner;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;
using WriteAPI.Filters;

namespace WriteAPI.Controllers
{
    [Authorize]
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
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task ChangeColor([FromBody]UpdateTitleNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPost("images/{id}")]
        public async Task UploadImages(List<IFormFile> photos, Guid id)
        {
            var email = this.GetUserEmail();
            var command = new UploadImageToNoteCommand() { NoteId = id, Photos = photos };
            command.Email = email;
            await this._mediator.Send(command);
        }

    }

}