using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Notes;
using Common.DTO.Notes;
using Common.DTO.Notes.AdditionalContent;
using Common.DTO.Personalization;
using Domain.Commands.Notes;
using Domain.Queries.Notes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers.Note
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NoteController : ControllerBase
    {
        private readonly IMediator _mediator;
        public NoteController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpGet("new")]
        public async Task<SmallNote> Add()
        {
            var email = this.GetUserEmail();
            var command = new NewPrivateNoteCommand(email);
            return await _mediator.Send(command);
        }

        // Commands

        [HttpPatch("color")]
        public async Task ChangeColor([FromBody] ChangeColorNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await _mediator.Send(command);
        }


        [HttpPatch("delete")]
        public async Task SetDeleteNotes([FromBody] SetDeleteNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await _mediator.Send(command);
        }


        [HttpPatch("delete/permanently")]
        public async Task DeleteNotes([FromBody] DeleteNotesCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await _mediator.Send(command);
        }


        [HttpPatch("copy")]
        public async Task<List<Guid>> CopyNote([FromBody] CopyNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            return await _mediator.Send(command);
        }


        [HttpPatch("archive")]
        public async Task ArchiveNote([FromBody] ArchiveNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await _mediator.Send(command);
        }


        [HttpPatch("ref/private")]
        public async Task MakePrivate([FromBody] MakePrivateNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await _mediator.Send(command);
        }


        [HttpPatch("label/add")]
        public async Task AddLabel([FromBody] AddLabelOnNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await _mediator.Send(command);
        }


        [HttpPatch("label/remove")]
        public async Task RemoveLabel([FromBody] RemoveLabelFromNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await _mediator.Send(command);
        }


        // GET Entities
        [HttpGet("type/{id}")]
        public async Task<List<SmallNote>> GetNotesByType(NoteTypeENUM id, [FromQuery] PersonalizationSettingDTO settings)
        {
            var email = this.GetUserEmail();
            var query = new GetNotesByTypeQuery(email, id, settings);
            return await _mediator.Send(query);
        }


        [HttpPost("additional")]
        public async Task<List<BottomNoteContent>> GetAdditionalInfo(GetAdditionalContentInfoQuery query)
        {
            query.Email = this.GetUserEmail();
            return await _mediator.Send(query);
        }

        [HttpPost("many")]
        public async Task<List<SmallNote>> GetNoteByIds(GetNotesByNoteIdsQuery query)
        {
            query.Email = this.GetUserEmail();
            return await _mediator.Send(query);
        }

        [HttpPost("all")]
        public async Task<List<SmallNote>> GetAllNotes(GetAllNotesQuery query)
        {
            query.Email = this.GetUserEmail();
            return await _mediator.Send(query);
        }

        [HttpGet("{id}")]
        public async Task<FullNoteAnswer> Get(Guid id)
        {
            var email = this.GetUserEmail();
            var query = new GetFullNoteQuery(email, id);
            return await _mediator.Send(query);
        }
    }
}