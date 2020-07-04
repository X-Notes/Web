using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Domain.Commands;
using Domain.Ids;
using Domain.Models;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
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
        public async Task Authorize([FromBody]NewUser user)
        {
            var response = await _mediator.Send(user);
        }

        [HttpPut("main")]
        public async Task UpdateMainInformation([FromBody]UpdateMainUserInfo info)
        {
            var response = await _mediator.Send(info);
        }
    }
}