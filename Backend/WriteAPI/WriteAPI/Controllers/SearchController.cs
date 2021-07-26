﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.Search;
using Domain.Queries.Search;
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
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPost("search")]
        public async Task<SearchNoteFolderResult> GetNoteAndFolders(GetNotesAndFolderForSearchQuery command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

    }
}