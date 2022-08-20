using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noots.Search.Entities;
using Noots.Search.Queries;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers;

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
    public async Task<List<ShortUserForShareModal>> GetByUsersForShareModal(GetUsersForSharingModalQuery command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("search")]
    public async Task<SearchNoteFolderResult> GetNoteAndFolders(GetNotesAndFolderForSearchQuery command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

}