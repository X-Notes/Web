using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.Personalization;
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
        public async Task<List<SmallNote>> GetNoteByFolderId(Guid id, [FromQuery] PersonalizationSettingDTO settings)
        {
            return await _mediator.Send(new GetFolderNotesByFolderIdQuery(id, this.GetUserId(), settings));
        }

        [HttpPost("preview")]
        public async Task<List<PreviewNoteForSelection>> GetNotesPreviewByFolderId(GetPreviewSelectedNotesForFolderQuery command)
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
        public async Task<OperationResult<Unit>> UpdateOrderNotesInFolder(UpdateNotesPositionInFolderCommand command)
        {
            command.UserId = this.GetUserId();
            return await this._mediator.Send(command);
        }
    }
}