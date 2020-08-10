using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.folders;
using Domain.Queries.folders;
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
    public class FolderController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FolderController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        [HttpGet("private")]
        public async Task<List<SmallFolder>> GetPrivateFolders()
        {
            var email = this.GetUserEmail();
            var query = new GetPrivateFoldersQuery(email);
            return await _mediator.Send(query);
        }

        [HttpGet("shared")]
        public async Task<List<SmallFolder>> GetSharedFolders()
        {
            var email = this.GetUserEmail();
            var query = new GetSharedFoldersQuery(email);
            return await _mediator.Send(query);
        }

        [HttpGet("archive")]
        public async Task<List<SmallFolder>> GetArchiveFolders()
        {
            var email = this.GetUserEmail();
            var query = new GetArchiveFoldersQuery(email);
            return await _mediator.Send(query);
        }

        [HttpGet("deleted")]
        public async Task<List<SmallFolder>> GetDeletedFolders()
        {
            var email = this.GetUserEmail();
            var query = new GetDeletedFoldersQuery(email);
            return await _mediator.Send(query);
        }

        [HttpGet("{id}")]
        public async Task<FullFolder> Get(string id)
        {
            var email = this.GetUserEmail();
            var query = new GetFullFolderQuery(email, id);
            return await _mediator.Send(query);
        }
    }
}