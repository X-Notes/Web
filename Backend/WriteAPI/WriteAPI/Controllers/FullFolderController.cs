using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.Notes;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.FolderInner;
using Domain.Queries.InnerFolder;
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
    public class FullFolderController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FullFolderController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpGet("{id}")]
        public async Task<List<SmallNote>> GetNoteByFolderId(Guid id)
        {
            var command = new GetFolderNotesByFolderId(id , this.GetUserEmail());
            return await this._mediator.Send(command);
        }

        [HttpPost("preview")]
        public async Task<List<PreviewNoteForSelection>> GetNotesPreviewByFolderId(GetPreviewSelectedNotesForFolderQuery command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPatch("title")]
        public async Task<OperationResult<Unit>> ChangeColor([FromBody]UpdateTitleFolderCommand command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            return await this._mediator.Send(command);
        }

        [HttpPatch("update/notes")]
        public async Task<OperationResult<Unit>> UpdateNotesInFolder(UpdateNotesInFolderCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPatch("remove/notes")]
        public async Task<OperationResult<Unit>> RemoveNotesFromFolder(RemoveNotesFromFolderCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }
    }
}