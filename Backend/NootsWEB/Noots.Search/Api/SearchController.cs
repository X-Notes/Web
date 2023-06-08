using Common;
using Common.Filters;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noots.Search.Entities;
using Noots.Search.Queries;

namespace Noots.Search.Api;

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
    [ValidationRequireUserIdFilter]
    public async Task<List<ShortUserForShareModal>> GetByUsersForShareModal(GetUsersForSharingModalQuery command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("search")]
    [ValidationRequireUserIdFilter]
    public async Task<SearchNoteFolderResult> GetNoteAndFolders(GetNotesAndFolderForSearchQuery command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

}