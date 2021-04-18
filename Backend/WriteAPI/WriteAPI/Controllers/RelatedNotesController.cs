using Common.DTO.notes;
using Domain.Commands.relatedNotes;
using Domain.Queries.relatedNotes;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        [HttpGet("{id}")]
        public async Task<List<SmallNote>> GetRelatedNotes(Guid id)
        {
            var email = this.GetUserEmail();
            var command = new GetRelatedNotesQuery(email, id);
            return await this._mediator.Send(command);
        }

        [HttpPost]
        public async Task<Unit> AddToRelatedNotesNotes(UpdateRelatedNotesToNoteCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

    }
}
