using Common;
using Common.DTO.Users;
using Common.Filters;
using Editor.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Editor.Api.Users;

[Authorize]
[Route("api/editor")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    public UsersController(IMediator _mediator)
    {
        this._mediator = _mediator;
    }

    [HttpGet("users/{id}")]
    [ValidationRequireUserIdFilter]
    public async Task<List<OnlineUserOnNote>> GetOnlineUsersByNoteId(Guid id)
    {
        var query = new GetOnlineUsersOnNoteQuery(id);
        query.UserId = this.GetUserId();
        return await _mediator.Send(query);
    }

}