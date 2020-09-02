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
        public async Task<JsonResult> Add()
        {
            var email = this.GetUserEmail();
            var command = new NewPrivateNoteCommand(email);
            return new JsonResult(await _mediator.Send(command));
        }

        // Commands
        [HttpPatch("color")]
        public async Task ChangeColor([FromBody]ChangeColorNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPatch("delete")]
        public async Task SetDeleteNotes([FromBody]SetDeleteNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPatch("delete/permanently")]
        public async Task DeleteNotes([FromBody]DeleteNotesCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPatch("restore")]
        public async Task RestoreNotes([FromBody]RestoreNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        [HttpPatch("copy")]
        public async Task<List<SmallNote>> CopyNote([FromBody]CopyNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            return await this._mediator.Send(command);
        }

        [HttpPatch("archive")]
        public async Task ArchiveNote([FromBody]ArchiveNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPatch("ref/public")]
        public async Task MakePublic([FromBody]MakePublicNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPatch("ref/private")]
        public async Task MakePrivate([FromBody]MakePrivateNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        [HttpPatch("label/add")]
        public async Task AddLabel([FromBody]AddLabelOnNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPatch("label/remove")]
        public async Task RemoveLabel([FromBody]RemoveLabelFromNoteCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        // GET Entities
        [HttpGet("private")]
        public async Task<List<SmallNote>> GetPrivateNotes()
        {
            var email = this.GetUserEmail();
            var query = new GetPrivateNotesQuery(email);
            return await _mediator.Send(query);
        }

        [HttpGet("shared")]
        public async Task<List<SmallNote>> GetSharedNotes()
        {
            var email = this.GetUserEmail();
            var query = new GetSharedNotesQuery(email);
            return await _mediator.Send(query);
        }

        [HttpGet("archive")]
        public async Task<List<SmallNote>> GetArchiveNotes()
        {
            var email = this.GetUserEmail();
            var query = new GetArchiveNotesQuery(email);
            return await _mediator.Send(query);
        }

        [HttpGet("deleted")]
        public async Task<List<SmallNote>> GetDeletedNotes()
        {
            var email = this.GetUserEmail();
            var query = new GetDeletedNotesQuery(email);
            return await _mediator.Send(query);
        }

        [HttpGet("{id}")]
        public async Task<FullNote> Get(string id)
        {
            var email = this.GetUserEmail();
            var query = new GetFullNoteQuery(email, id);
            return await _mediator.Send(query);
        }

        [HttpGet("user/{id}")]
        public async Task<List<OnlineUserOnNote>> GetOnlineUsersByNoteId(string id)
        {
            var query = new GetOnlineUsersOnNote(id);
            return await _mediator.Send(query);
        }
    }
}