using Common;
using Common.DTO;
using Common.Filters;
using Editor.Commands.Text;
using Editor.Commands.Title;
using Editor.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Editor.Api.Text;

[Authorize]
[Route("api/editor/text")]
[ApiController]
public class TextController : ControllerBase
{
    private readonly IMediator _mediator;
    public TextController(IMediator _mediator)
    {
        this._mediator = _mediator;
    }

    [HttpPatch("title")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> UpdateTitle([FromBody] UpdateTitleNoteCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPatch("sync")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<List<UpdateBaseContentResult>>> SyncTextContents(UpdateTextContentsCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }
}