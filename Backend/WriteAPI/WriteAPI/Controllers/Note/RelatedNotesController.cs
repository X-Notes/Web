using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO.Notes;
using Domain.Commands.RelatedNotes;
using Domain.Queries.RelatedNotes;
using WriteAPI.ControllerConfig;
using Microsoft.AspNetCore.Authorization;
using Common.DTO;

namespace WriteAPI.Controllers.Note
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class RelatedNotesController : ControllerBase
    {
        private readonly IMediator _mediator;
        public RelatedNotesController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        [HttpPost("preview")]
        public async Task<List<PreviewNoteForSelection>> GetPreviewNotes(GetNotesForPreviewWindowQuery command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }


        [HttpGet("{id}")]
        public async Task<List<RelatedNote>> GetRelatedNotes(Guid id)
        {
            var command = new GetRelatedNotesQuery(this.GetUserId(), id);
            return await _mediator.Send(command);
        }

        [HttpPost]
        public async Task<OperationResult<Unit>> UpdateRelatedNotesNotes(UpdateRelatedNotesToNoteCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }

        [HttpPatch("state")]
        public async Task<OperationResult<Unit>> UpdateRelatedNoteState(UpdateRelatedNoteStateCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }


        [HttpPatch("order")]
        public async Task<OperationResult<Unit>> UpdateRelatedNoteOrder(ChangeOrderRelatedNotesCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }

    }
}
