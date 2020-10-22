using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.search;
using Domain.Queries.search;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WriteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly IMediator _mediator;
        public SearchController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        [HttpPost("share/modal")]
        public async Task<List<ShortUserForShareModal>> GetByUsersForShareModal(GetUsersForSharingModalQuery command)
        {
            return await _mediator.Send(command);
        }
    }
}