using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BI.Services.Notes.Interaction;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteSyncContents;
using Domain.Commands.NoteInner;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noots.Notes.Queries;
using WriteAPI.ControllerConfig;
using WriteAPI.Filters;


namespace WriteAPI.Controllers.FullNoteAPI;

[Authorize]
[Route("api/note/inner/contents")]
[ApiController]
public class FullNoteContentController : ControllerBase
{
    private readonly IMediator _mediator;

    public FullNoteContentController(IMediator _mediator)
    {
        this._mediator = _mediator;
    }

    [HttpGet("{noteId}")]
    [AllowAnonymous]
    public async Task<OperationResult<List<BaseNoteContentDTO>>> GetNoteContents(Guid noteId, [FromQuery] Guid? folderId)
    {
        var command = new GetNoteContentsQuery(this.GetUserIdUnStrict(), noteId, folderId);
        return await this._mediator.Send(command);
    }

    [HttpPatch("sync/structure")] // TODO TO WS
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<NoteStructureResult>> SyncNoteStructure(SyncNoteStructureCommand command)
    {
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }

    [HttpPost("cursor")]
    public async Task UpdateCursorPosition(UpdateCursorCommand command)
    {
        command.UserId = this.GetUserId();
        await this._mediator.Send(command);
    }
}