using System.Threading.Tasks;
using Common.DTO;
using Domain.Commands.NoteInner.FileContent.Texts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;


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
    public async Task<OperationResult<Unit>> UpdateTitle([FromBody]UpdateTitleNoteCommand command)
    {          
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }

    [HttpPatch("sync")] // TODO TO WS
    public async Task<OperationResult<Unit>> SyncTextContents(UpdateTextContentsCommand command)
    {
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }
}