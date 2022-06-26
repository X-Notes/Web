using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteSyncContents;
using Domain.Commands.NoteInner;
using Domain.Queries.Notes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;


namespace WriteAPI.Controllers.FullNoteAPI
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
        [AllowAnonymous]
        public async Task<OperationResult<List<BaseNoteContentDTO>>> GetNoteContents(Guid noteId)
        {
            var command = new GetNoteContentsQuery(this.GetUserIdUnStrict(), noteId);
            return await this._mediator.Send(command);
        }

        [HttpPatch("sync/structure")] // TODO TO WS
        public async Task<OperationResult<NoteStructureResult>> SyncNoteStructure(SyncNoteStructureCommand command)
        {
            command.UserId = this.GetUserId();
            return await this._mediator.Send(command);
        }

    }

}