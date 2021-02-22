using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.folders;
using Domain.Commands.folders;
using Domain.Queries.folders;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;
using WriteAPI.Filters;

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


        [HttpGet("new")]
        public async Task<SmallFolder> Add()
        {
            var email = this.GetUserEmail();
            var command = new NewFolderCommand(email);
            return await _mediator.Send(command);
        }

        [HttpGet("type/{id}")]
        public async Task<List<SmallFolder>> GetPrivateFolders(Guid id)
        {
            var email = this.GetUserEmail();
            var query = new GetFoldersByTypeQuery(email, id);
            return await _mediator.Send(query);
        }




        [HttpGet("{id}")]
        public async Task<FullFolderAnswer> Get(Guid id)
        {
            var email = this.GetUserEmail();
            var query = new GetFullFolderQuery(email, id);
            return await _mediator.Send(query);
        }

        // Commands 

        [HttpPatch("archive")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task ArchiveFolder([FromBody]ArchiveFolderCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPatch("color")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task ChangeColor([FromBody]ChangeColorFolderCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        [HttpPatch("restore")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task RestoreNotes([FromBody]RestoreFolderCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPatch("delete")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task SetDeleteNotes([FromBody]SetDeleteFolderCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPatch("copy")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task<List<SmallFolder>> CopyNote([FromBody]CopyFolderCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            return await this._mediator.Send(command);
        }

        [HttpPatch("delete/permanently")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task DeleteNotes([FromBody]DeleteFoldersCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        [HttpPatch("ref/private")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task MakePrivate([FromBody]MakePrivateFolderCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }
    }
}