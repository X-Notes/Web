﻿using Common;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteSyncContents;
using Common.Filters;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noots.Editor.Commands.Structure;
using Noots.Editor.Queries;
using Noots.Editor.Services.Interaction;


namespace Noots.Editor.Api;

[Authorize]
[Route("api/editor/contents")]
[ApiController]
public class ContentController : ControllerBase
{
    private readonly IMediator _mediator;

    public ContentController(IMediator _mediator)
    {
        this._mediator = _mediator;
    }

    [HttpGet("{noteId}")]
    [AllowAnonymous]
    public async Task<OperationResult<List<BaseNoteContentDTO>>> GetNoteContents(Guid noteId, [FromQuery] Guid? folderId)
    {
        var command = new GetNoteContentsQuery(this.GetUserIdUnStrict(), noteId, folderId);
        return await _mediator.Send(command);
    }

    [HttpPatch("sync/structure")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<NoteStructureResult>> SyncNoteStructure(SyncNoteStructureCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("cursor")]
    public async Task UpdateCursorPosition(UpdateCursorCommand command)
    {
        command.UserId = this.GetUserId();
        await _mediator.Send(command);
    }
}