using Common;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteSyncContents;
using Common.Filters;
using Editor.Commands.Structure;
using Editor.Commands.Sync;
using Editor.Queries;
using Editor.Services.Interaction;
using Editor.Services.Sync.Entities;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Editor.Api;

[Authorize]
[Route("api/editor/contents")]
[ApiController]
public class ContentController(IMediator mediator, IValidator<NewTextContent> validator) : ControllerBase
{
    [HttpGet("{noteId}")]
    [AllowAnonymous]
    public async Task<OperationResult<List<BaseNoteContentDTO>>> GetNoteContents(Guid noteId, [FromQuery] Guid? folderId)
    {
        var command = new GetNoteContentsQuery(this.GetUserIdUnStrict(), noteId, folderId);
        return await mediator.Send(command);
    }

    [HttpPatch("sync/structure")]
    [ValidationRequireUserIdFilter]
    public async Task<ActionResult<OperationResult<NoteStructureResult>>> SyncNoteStructure(SyncNoteStructureCommand command)
    {
        var isValid = command.Diffs.NewTextItems.Select(validator.Validate).All(x => x.IsValid);
        if (!isValid)
        {
            return BadRequest("Invalid model");
        }

        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }

    [HttpPatch("sync/state")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<SyncStateResult>> SyncEditorState(SyncEditorStateCommand command)
    {
        command.UserId = this.GetUserId();
        return await mediator.Send(command);
    }

    [HttpPost("cursor")]
    public async Task UpdateCursorPosition(UpdateCursorCommand command)
    {
        command.UserId = this.GetUserId();
        await mediator.Send(command);
    }
}