﻿using Common;
using Common.DTO;
using Common.DTO.Notes;
using Common.Filters;
using Folders.Commands.FolderInner;
using Folders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Search.Queries;

namespace Folders.Api;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class FullFolderController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [AllowAnonymous]
    public async Task<List<SmallNote>> GetNotesByFolderId(GetFolderNotesByFolderIdQuery query)
    {
        query.UserId = this.GetUserIdUnStrict();
        return await mediator.Send(query);
    }

    [HttpPost("preview")]
    [ValidationRequireUserIdFilter]
    public async Task<List<SmallNote>> GetNotesPreviewByFolderId(GetPreviewSelectedNotesForFolderQuery command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }

    [HttpPatch("title")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> ChangeColor([FromBody] UpdateTitleFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }

    [HttpPatch("add/notes")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> AddNotesToFolder(AddNotesToFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }

    [HttpPatch("remove/notes")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> RemoveNotesFromFolder(RemoveNotesFromFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }

    [HttpPatch("order/notes")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> UpdateOrderNotesInFolder(UpdateNotesPositionsInFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }
}