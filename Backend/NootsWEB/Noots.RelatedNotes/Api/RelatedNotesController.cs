using MediatR;
using Microsoft.AspNetCore.Mvc;
using Common.DTO.Notes;
using Microsoft.AspNetCore.Authorization;
using Common.DTO;
using Common.DTO.WebSockets.ReletedNotes;
using Noots.RelatedNotes.Commands;
using Noots.RelatedNotes.Queries;
using Common;
using Common.Filters;
using Search.Queries;

namespace Noots.RelatedNotes.Api;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class RelatedNotesController : ControllerBase
{
    private readonly IMediator _mediator;
    public RelatedNotesController(IMediator _mediator)
    {
        this._mediator = _mediator;
    }

    [HttpPost("preview")]
    [ValidationRequireUserIdFilter]
    public async Task<List<PreviewNoteForSelection>> GetPreviewNotes(GetNotesForPreviewWindowQuery command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpGet("{noteId}")]
    [ValidationRequireUserIdFilter]
    public async Task<List<RelatedNote>> GetRelatedNotes(Guid noteId)
    {
        var command = new GetRelatedNotesQuery(this.GetUserId(), noteId);
        return await _mediator.Send(command);
    }

    [HttpPost]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<UpdateRelatedNotesWS>> UpdateRelatedNotesNotes(UpdateRelatedNotesToNoteCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPatch("state")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> UpdateRelatedNoteState(UpdateRelatedNoteStateCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }


    [HttpPatch("order")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> UpdateRelatedNoteOrder(ChangeOrderRelatedNotesCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

}