using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.Notes;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.RelatedNotes;
using Domain.Queries.RelatedNotes;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers
{
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
            command.Email =  this.GetUserEmail();
            return await this._mediator.Send(command);
        }


        [HttpGet("{id}")]
        public async Task<List<RelatedNote>> GetRelatedNotes(Guid id)
        {
            var email = this.GetUserEmail();
            var command = new GetRelatedNotesQuery(email, id);
            return await this._mediator.Send(command);
        }

        [HttpPost]
        public async Task<OperationResult<Unit>> UpdateRelatedNotesNotes(UpdateRelatedNotesToNoteCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPatch("state")]
        public async Task<OperationResult<Unit>> UpdateRelatedNoteState(UpdateRelatedNoteStateCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }


        [HttpPatch("order")]
        public async Task<OperationResult<Unit>> UpdateRelatedNoteOrder(ChangeOrderRelatedNotesCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

    }
}
