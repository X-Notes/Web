using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO.Users;
using Domain.Commands.Share.Folders;
using Domain.Commands.Share.Notes;
using Domain.Queries.Sharing;
using WriteAPI.ControllerConfig;
using WriteAPI.Filters;
using Common.DTO;

namespace WriteAPI.Controllers
{
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

        [HttpPost("folders/share")]
        public async Task<OperationResult<Unit>> ToPublicEditShareFolders(ChangeRefTypeFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            return await this._mediator.Send(command);
        }

        [HttpPost("folders/user/permission")]
        public async Task<OperationResult<Unit>> ChangeUserPermissionOnFolder(PermissionUserOnPrivateFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            return await this._mediator.Send(command);
        }

        [HttpPost("folders/user/remove")]
        public async Task<OperationResult<Unit>> RemoveUserFromFolder(RemoveUserFromPrivateFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            return await this._mediator.Send(command);
        }

        [HttpPost("folders/user/invites")]
        public async Task InvitesUsersToFolder(SendInvitesToUsersFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpGet("folders/user/invites/{folderId}")]
        public async Task<List<InvitedUsersToFoldersOrNote>> GetInvitedToFolderUsers(Guid folderId)
        {
            var command = new GetUsersOnPrivateFolderQuery { FolderId = folderId, Email = this.GetUserEmail() };
            return await this._mediator.Send(command);
        }


        // NOTES 

        [HttpPost("notes/share")]
        public async Task<OperationResult<Unit>> ToPublicEditShareNotes(ChangeRefTypeNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            return await this._mediator.Send(command);
        }


        [HttpPost("notes/user/permission")]
        public async Task<OperationResult<Unit>> ChangeUserPermissionOnNote(PermissionUserOnPrivateNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            return await this._mediator.Send(command);
        }

        [HttpPost("notes/user/remove")]
        public async Task<OperationResult<Unit>> RemoveUserFromNote(RemoveUserFromPrivateNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            return await this._mediator.Send(command);
        }

        [HttpPost("notes/user/invites")]
        public async Task InvitesUsersToNotes(SendInvitesToUsersNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpGet("notes/user/invites/{noteId}")]
        public async Task<List<InvitedUsersToFoldersOrNote>> GetInvitedToNoteUsers(Guid noteId)
        {
            var command = new GetUsersOnPrivateNoteQuery { NoteId = noteId, Email = this.GetUserEmail() };
            return await this._mediator.Send(command);
        }

    }
}