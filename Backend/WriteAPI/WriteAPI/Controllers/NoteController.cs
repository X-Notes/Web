using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.notes;
using Common.DTO.users;
using Domain.Commands.notes;
using Domain.Queries.notes;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers
{
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
            var command = new NewNoteCommand(email);
            return new JsonResult(await _mediator.Send(command));
        }

        [HttpGet]
        public async Task<List<SmallNote>> GetAll()
        {
            var email = this.GetUserEmail();
            var query = new GetAllNotesQuery(email);
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