using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO.Users;
using Domain.Queries.Notes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;


namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/note/inner")]
    [ApiController]
    public class FullNoteController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FullNoteController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        [HttpGet("users/{id}")]
        [AllowAnonymous]
        public async Task<List<OnlineUserOnNote>> GetOnlineUsersByNoteId(Guid id)
        {
            var query = new GetOnlineUsersOnNoteQuery(id);
            query.UserId = this.GetUserIdUnStrict();
            return await _mediator.Send(query);
        }

    }

}