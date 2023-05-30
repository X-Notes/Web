using Common;
using Common.DTO;
using Common.DTO.Notes;
using Common.Filters;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noots.Folders.Commands.FolderInner;
using Noots.Folders.Queries;
using Noots.Search.Queries;

namespace Noots.Folders.Api;

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
    [ValidationRequireUserIdFilter]
    public async Task<List<SmallNote>> GetNotesPreviewByFolderId(GetPreviewSelectedNotesForFolderQuery command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPatch("title")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> ChangeColor([FromBody] UpdateTitleFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPatch("add/notes")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> AddNotesToFolder(AddNotesToFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPatch("remove/notes")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> RemoveNotesFromFolder(RemoveNotesFromFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPatch("order/notes")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> UpdateOrderNotesInFolder(UpdateNotesPositionsInFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }
}