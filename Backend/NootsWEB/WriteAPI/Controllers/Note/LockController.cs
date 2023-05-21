using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WriteAPI.ControllerConfig;
using Microsoft.AspNetCore.Authorization;
using Common.DTO;
using System;
using Noots.Encryption.Queries;
using Noots.Encryption.Impl;
using Noots.Encryption.Commands;
using WriteAPI.Filters;

namespace WriteAPI.Controllers.Note;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class LockController : ControllerBase
{
    private readonly IMediator _mediator;

    private readonly bool Disabled = true;

    private readonly UserNoteEncryptService userNoteEncryptStorage;

    public LockController(IMediator _mediator, UserNoteEncryptService userNoteEncryptStorage)
    {
        this._mediator = _mediator;
        this.userNoteEncryptStorage = userNoteEncryptStorage;
    }


    [HttpPost("encrypt")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<bool>> EncryptNote(EncryptionNoteCommand command)
    {
        if (Disabled) { return null; }

        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("decrypt")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<bool>> DecryptNote(DecriptionNoteCommand command)
    {
        if (Disabled) { return null; }

        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("unlock")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<bool>> UnlockNote(UnlockNoteQuery query)
    {
        if (Disabled) { return null; }

        query.UserId = this.GetUserId();
        return await _mediator.Send(query);
    }

    [HttpGet("force/{noteId}")]
    public async Task<OperationResult<bool>> ForceLockNote(Guid noteId)
    {
        if (Disabled) { return null; } 

        await userNoteEncryptStorage.RemoveUnlockTime(noteId);
        return new OperationResult<bool>(true, true);
    }
}