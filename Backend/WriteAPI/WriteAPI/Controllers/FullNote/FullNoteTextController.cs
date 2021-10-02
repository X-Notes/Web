using System.Threading.Tasks;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner.FileContent.Texts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;


namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/note/inner")]
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


        [HttpPatch("text/type")]
        public async Task<OperationResult<Unit>> UpdateType(TransformTextTypeCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPatch("text")]
        public async Task<OperationResult<Unit>> UpdateText(UpdateTextNoteCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

    }

}