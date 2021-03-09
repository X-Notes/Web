using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.models.NoteContent;
using Common.DTO.notes.FullNoteContent;
using Domain.Commands.noteInner;
using Domain.Queries.notes;
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
            var command = new UploadImageToNoteCommand() { NoteId = id, Photos = photos };
            command.Email = this.GetUserEmail();
            await this._mediator.Send(command);
        }

        [HttpPatch("text/type")]
        public async Task<TextOperationResult<Unit>> UpdateType(TransformTextTypeCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPatch("text")]
        public async Task UpdateText(UpdateTextNoteCommand command)
        {
            command.Email = this.GetUserEmail();
            await this._mediator.Send(command);
        }

        [HttpPost("content/concat")]
        public async Task<TextOperationResult<TextNoteDTO>> ConcatLine(ConcatWithPreviousCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }


        [HttpPost("content/remove")]
        public async Task<TextOperationResult<Unit>> RemoveLine(RemoveContentCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPost("content/insert")]
        public async Task<TextOperationResult<TextNoteDTO>> InsertLine(InsertLineCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPost("content/new")]
        public async Task<TextOperationResult<TextNoteDTO>> NewLine(NewLineTextContentNoteCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpGet("contents/{id}")]
        public async Task<List<BaseContentNoteDTO>> GetNoteContent(Guid id)
        {
            var email = this.GetUserEmail();
            var command = new GetNoteContentsQuery(email, id);
            return await this._mediator.Send(command);
        }

    }

}