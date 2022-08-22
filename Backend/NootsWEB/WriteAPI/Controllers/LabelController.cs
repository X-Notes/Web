using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Labels;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noots.Labels.Commands;
using Noots.Labels.Queries;
using WriteAPI.ControllerConfig;
using WriteAPI.Filters;

namespace WriteAPI.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class LabelController : ControllerBase
{
    private readonly IMediator _mediator;
    public LabelController(IMediator _mediator)
    {
        this._mediator = _mediator;
    }

    [HttpPost]
    [ValidationRequireUserIdFilter]
    public async Task<JsonResult> Add(NewLabelCommand command)
    {
        command.UserId = this.GetUserId();
        return new JsonResult(await _mediator.Send(command));
    }

    [HttpGet]
    [ValidationRequireUserIdFilter]
    public async Task<List<LabelDTO>> GetUserLabels()
    {
        return await _mediator.Send(new GetLabelsQuery(this.GetUserId()));
    }

    [HttpGet("count/{id}")]
    [ValidationRequireUserIdFilter]
    public async Task<int> NotesCountByLabel(Guid id)
    {
        var command = new GetCountNotesByLabelQuery { LabelId = id };
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPut]
    [ValidationRequireUserIdFilter]
    public async Task Update(UpdateLabelCommand command)
    {
        command.UserId = this.GetUserId();
        await _mediator.Send(command);
    }

    [HttpDelete("perm/{id}")]
    [ValidationRequireUserIdFilter]
    public async Task DeletePerm(Guid id)
    {
        await _mediator.Send(new DeleteLabelCommand(this.GetUserId(), id));
    }

    [HttpDelete("{id}")]
    [ValidationRequireUserIdFilter]
    public async Task Delete(Guid id)
    {
        await _mediator.Send(new SetDeletedLabelCommand(this.GetUserId(), id));
    }

    [HttpGet("restore/{id}")]
    [ValidationRequireUserIdFilter]
    public async Task RestoreLabel(Guid id)
    {
        await _mediator.Send(new RestoreLabelCommand(this.GetUserId(), id));
    }

    [HttpDelete]
    [ValidationRequireUserIdFilter]
    public async Task RemoveAllFromBin()
    {
        await _mediator.Send(new RemoveAllFromBinCommand(this.GetUserId()));
    }

    [HttpPatch("order")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> UpdateOrder(UpdatePositionsLabelCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }
}