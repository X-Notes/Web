using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO.Users;
using WriteAPI.ControllerConfig;
using Common.DTO;
using Noots.Sharing.Commands.Notes;
using Noots.Sharing.Queries;
using Noots.Sharing.Commands.Folders;

namespace WriteAPI.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ShareController : ControllerBase
{
    private readonly IMediator _mediator;
    public ShareController(IMediator _mediator)
    {
        this._mediator = _mediator;
    }

    // FOLDERS

    [HttpPost("folders/clear")]
    public async Task<OperationResult<Unit>> RemoveAllUsersFromNote(RemoveAllUsersFromFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }

    [HttpPost("folders/share")]
    public async Task<OperationResult<Unit>> ToPublicEditShareFolders(ChangeRefTypeFolders command)
    {
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }

    [HttpPost("folders/user/permission")]
    public async Task<OperationResult<Unit>> ChangeUserPermissionOnFolder(PermissionUserOnPrivateFolders command)
    {
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }

    [HttpPost("folders/user/remove")]
    public async Task<OperationResult<Unit>> RemoveUserFromFolder(RemoveUserFromPrivateFolders command)
    {
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }

    [HttpPost("folders/user/invites")]
    public async Task InvitesUsersToFolder(SendInvitesToUsersFolders command)
    {
        command.UserId = this.GetUserId();
        await this._mediator.Send(command);
    }

    [HttpGet("folders/user/invites/{folderId}")]
    public async Task<List<InvitedUsersToFoldersOrNote>> GetInvitedToFolderUsers(Guid folderId)
    {
        var command = new GetUsersOnPrivateFolderQuery { FolderId = folderId, UserId = this.GetUserId() };
        return await this._mediator.Send(command);
    }


    // NOTES 

    [HttpPost("notes/clear")]
    public async Task<OperationResult<Unit>> RemoveAllUsersFromNote(RemoveAllUsersFromNoteCommand command)
    {
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }

    [HttpPost("notes/share")]
    public async Task<OperationResult<Unit>> ToPublicEditShareNotes(ChangeRefTypeNotes command)
    {
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }


    [HttpPost("notes/user/permission")]
    public async Task<OperationResult<Unit>> ChangeUserPermissionOnNote(PermissionUserOnPrivateNotes command)
    {
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }

    [HttpPost("notes/user/remove")]
    public async Task<OperationResult<Unit>> RemoveUserFromNote(RemoveUserFromPrivateNotes command)
    {
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }

    [HttpPost("notes/user/invites")]
    public async Task<OperationResult<Unit>> InvitesUsersToNotes(SendInvitesToUsersNotes command)
    {
        command.UserId = this.GetUserId();
        return await this._mediator.Send(command);
    }

    [HttpGet("notes/user/invites/{noteId}")]
    public async Task<List<InvitedUsersToFoldersOrNote>> GetInvitedToNoteUsers(Guid noteId)
    {
        var command = new GetUsersOnPrivateNoteQuery { NoteId = noteId, UserId = this.GetUserId() };
        return await this._mediator.Send(command);
    }

}