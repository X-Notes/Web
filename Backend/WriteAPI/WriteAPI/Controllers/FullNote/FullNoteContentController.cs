using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner;
using Domain.Queries.Notes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;


namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/note/inner/contents")]
    [ApiController]
    public class FullNoteContentController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FullNoteContentController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpPost("concat")]
        public async Task<OperationResult<TextNoteDTO>> ConcatLine(ConcatWithPreviousCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPost("remove")]
        public async Task<OperationResult<Unit>> RemoveLine(RemoveContentCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPost("insert")]
        public async Task<OperationResult<TextNoteDTO>> InsertLine(InsertLineCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPost("new")]
        public async Task<OperationResult<TextNoteDTO>> NewLine(NewLineTextContentNoteCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpGet("{noteId}")]
        public async Task<List<BaseContentNoteDTO>> GetNoteContents(Guid noteId)
        {
            var email = this.GetUserEmail();
            var command = new GetNoteContentsQuery(email, noteId);
            return await this._mediator.Send(command);
        }
    }

}