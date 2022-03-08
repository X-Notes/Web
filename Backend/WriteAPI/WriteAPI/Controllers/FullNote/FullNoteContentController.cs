using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO;
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

        [HttpGet("{noteId}")]
        public async Task<OperationResult<List<BaseNoteContentDTO>>> GetNoteContents(Guid noteId)
        {
            var command = new GetNoteContentsQuery(this.GetUserId(), noteId);
            return await this._mediator.Send(command);
        }

        [HttpPatch("sync/structure")]
        public async Task<OperationResult<Unit>> SyncNoteStructure(SyncNoteStructureCommand command)
        {
            command.UserId = this.GetUserId();
            return await this._mediator.Send(command);
        }

    }

}