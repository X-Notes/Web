using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noots.Editor.Commands.Text;
using Noots.Editor.Commands.Title;
using Noots.Editor.Entities;
using WriteAPI.ControllerConfig;
using WriteAPI.Filters;


namespace WriteAPI.Controllers.FullNoteAPI;

[Authorize]
[Route("api/note/inner/text")]
[ApiController]
public class FullNoteTextController : ControllerBase
{
    private readonly IMediator _mediator;
    public FullNoteTextController(IMediator _mediator)
    {
        this._mediator = _mediator;
    }

    [HttpPatch("title")] // TODO TO WS
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> UpdateTitle([FromBody]UpdateTitleNoteCommand command)
    {          
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }

    [HttpPatch("sync")] // TODO TO WS
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<List<UpdateBaseContentResult>>> SyncTextContents(UpdateTextContentsCommand command)
    {
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }
}