using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using Domain.Commands.FolderInner;
using Domain.Queries.InnerFolder;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;

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


        [HttpPost]
        [AllowAnonymous]
        public async Task<List<SmallNote>> GetNotesByFolderId(GetFolderNotesByFolderIdQuery query)
        {
            query.UserId = this.GetUserIdUnStrict();
            return await _mediator.Send(query);
        }

        [HttpPost("preview")]
        public async Task<List<SmallNote>> GetNotesPreviewByFolderId(GetPreviewSelectedNotesForFolderQuery command)
        {
            command.UserId = this.GetUserId();
            return await this._mediator.Send(command);
        }

        [HttpPatch("title")]
        public async Task<OperationResult<Unit>> ChangeColor([FromBody]UpdateTitleFolderCommand command)
        {
            command.UserId = this.GetUserId();
            return await this._mediator.Send(command);
        }

        [HttpPatch("add/notes")]
        public async Task<OperationResult<Unit>> AddNotesToFolder(AddNotesToFolderCommand command)
        {
            command.UserId = this.GetUserId();
            return await this._mediator.Send(command);
        }

        [HttpPatch("remove/notes")]
        public async Task<OperationResult<Unit>> RemoveNotesFromFolder(RemoveNotesFromFolderCommand command)
        {
            command.UserId = this.GetUserId();
            return await this._mediator.Send(command);
        }

        [HttpPatch("order/notes")]
        public async Task<OperationResult<Unit>> UpdateOrderNotesInFolder(UpdateNotesPositionsInFolderCommand command)
        {
            command.UserId = this.GetUserId();
            return await this._mediator.Send(command);
        }
    }
}