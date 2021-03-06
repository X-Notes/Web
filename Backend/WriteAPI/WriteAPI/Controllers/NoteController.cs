using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.notes;
using Common.DTO.users;
using Domain.Commands.notes;
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
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task ChangeColor([FromBody]ChangeColorNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        [HttpPatch("delete")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task SetDeleteNotes([FromBody]SetDeleteNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        [HttpPatch("delete/permanently")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task DeleteNotes([FromBody]DeleteNotesCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        [HttpPatch("copy")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task<List<SmallNote>> CopyNote([FromBody]CopyNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            return await this._mediator.Send(command);
        }


        [HttpPatch("archive")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task ArchiveNote([FromBody]ArchiveNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        [HttpPatch("ref/private")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task MakePrivate([FromBody]MakePrivateNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        [HttpPatch("label/add")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task AddLabel([FromBody]AddLabelOnNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        [HttpPatch("label/remove")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task RemoveLabel([FromBody]RemoveLabelFromNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        // GET Entities
        [HttpGet("type/{id}")]
        public async Task<List<SmallNote>> GetNotesByType(Guid id)
        {
            var email = this.GetUserEmail();
            var query = new GetNotesByTypeQuery(email, id);
            return await _mediator.Send(query);
        }

        [HttpGet("all")]
        public async Task<List<SmallNote>> GetAllNotes()
        {
            var query = new GetAllNotesQuery();
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

        [HttpGet("user/{id}")]
        public async Task<List<OnlineUserOnNote>> GetOnlineUsersByNoteId(Guid id)
        {
            var query = new GetOnlineUsersOnNote(id);
            return await _mediator.Send(query);
        }
    }
}