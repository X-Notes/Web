using Common;
using Common.DTO;
using Common.DTO.Notes.FullNoteSyncContents;
using Common.Filters;
using Common.Validators;
using Editor.Commands.Text;
using Editor.Commands.Title;
using Editor.Entities;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Editor.Api.Text;

[Authorize]
[Route("api/editor/text")]
[ApiController]
public class TextController(IMediator mediator, IValidator<TextDiff> validator) : ControllerBase
{
    [HttpPatch("title")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> UpdateTitle([FromBody] UpdateTitleNoteCommand command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }

    [HttpPatch("sync")]
    [ValidationRequireUserIdFilter]
    public async Task<ActionResult<OperationResult<List<UpdateBaseContentResult>>>> SyncTextContents(UpdateTextContentsCommand command)
    {
        command.UserId = this.GetUserId();

        var isValid = command.Texts.Select(validator.Validate).All(x => x.IsValid);
        if (!isValid)
        {
            return BadRequest("Invalid model");
        }

        return await mediator.Send(command);
    }
}