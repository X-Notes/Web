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
        public async Task ChangeColor([FromBody]ChangeColorNoteCommand model)
        {
            var email = this.GetUserEmail();
            model.Email = email;
            await this._mediator.Send(model);
        }

        [HttpGet("copy/{id}")]
        public async Task CopyNote(string id)
        {

        }

        [HttpGet("delete/{id}")]
        public async Task DeleteNote(string id)
        {

        }

        [HttpGet("archive/{id}")]
        public async Task ArchiveNote(string id)
        {

        }

        [HttpGet("restore/{id}")]
        public async Task RestoreNote(string id)
        {

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
        public async Task<FullNote> GetAll(string id)
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