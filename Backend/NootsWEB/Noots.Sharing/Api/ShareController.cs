using Common;
using Common.DTO;
using Common.DTO.Users;
using Common.Filters;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sharing.Commands.Folders;
using Sharing.Commands.Notes;
using Sharing.Queries;

namespace Sharing.Api;

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
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> RemoveAllUsersFromNote(RemoveAllUsersFromFolderCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("folders/share")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> ToPublicEditShareFolders(ChangeRefTypeFolders command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("folders/user/permission")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> ChangeUserPermissionOnFolder(PermissionUserOnPrivateFolders command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("folders/user/remove")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> RemoveUserFromFolder(RemoveUserFromPrivateFolders command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("folders/user/invites")]
    [ValidationRequireUserIdFilter]
    public async Task InvitesUsersToFolder(SendInvitesToUsersFolders command)
    {
        command.UserId = this.GetUserId();
        await _mediator.Send(command);
    }

    [HttpGet("folders/user/invites/{folderId}")]
    [ValidationRequireUserIdFilter]
    public async Task<List<InvitedUsersToFoldersOrNote>> GetInvitedToFolderUsers(Guid folderId)
    {
        var command = new GetUsersOnPrivateFolderQuery { FolderId = folderId, UserId = this.GetUserId() };
        return await _mediator.Send(command);
    }


    // NOTES 

    [HttpPost("notes/clear")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> RemoveAllUsersFromNote(RemoveAllUsersFromNoteCommand command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("notes/share")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> ToPublicEditShareNotes(ChangeRefTypeNotes command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }


    [HttpPost("notes/user/permission")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> ChangeUserPermissionOnNote(PermissionUserOnPrivateNotes command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("notes/user/remove")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> RemoveUserFromNote(RemoveUserFromPrivateNotes command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("notes/user/invites")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<Unit>> InvitesUsersToNotes(SendInvitesToUsersNotes command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpGet("notes/user/invites/{noteId}")]
    [ValidationRequireUserIdFilter]
    public async Task<List<InvitedUsersToFoldersOrNote>> GetInvitedToNoteUsers(Guid noteId)
    {
        var command = new GetUsersOnPrivateNoteQuery { NoteId = noteId, UserId = this.GetUserId() };
        return await _mediator.Send(command);
    }

}