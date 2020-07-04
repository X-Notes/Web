using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO;
using Domain;
using Domain.Commands;
using Domain.Ids;
using Domain.Models;
using Domain.Queries.users;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using WriteAPI.ControllerConfig;
using WriteAPI.Services;

namespace WriteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IMediator _mediator;
        public UserController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        [HttpPost]
        public async Task<ShortUser> Authorize([FromBody]NewUser user)
        {
            var currentUserEmail = this.GetUserEmail();
            await _mediator.Send(user);
            return await _mediator.Send(new GetShortUser(currentUserEmail));
        }


        [HttpGet("short")]
        public async Task<ShortUser> GetShort()
        {
            var currentUserEmail = this.GetUserEmail();
            return await _mediator.Send(new GetShortUser(currentUserEmail));
        }

        [HttpPut("main")]
        public async Task UpdateMainInformation([FromBody]UpdateMainUserInfo info)
        {
            await _mediator.Send(info);
        }
    }
}