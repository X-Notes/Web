using System.Threading.Tasks;
using Common.DTO;
using Domain.Commands.NoteInner.FileContent.Texts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;


namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/note/inner/text")]
    [ApiController]
    public class FullNoteTextController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FullNoteTextController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        [HttpPatch("title")]
        public async Task<OperationResult<Unit>> UpdateTitle([FromBody]UpdateTitleNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            return await this._mediator.Send(command);
        }

        [HttpPatch("sync")]
        public async Task<OperationResult<Unit>> SyncTextContents(UpdateTextContentsCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }
    }

}