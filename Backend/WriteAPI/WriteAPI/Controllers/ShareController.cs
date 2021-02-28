using Common.DTO.users;
using Domain.Commands.share.folders;
using Domain.Commands.share.notes;
using Domain.Queries.sharing;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WriteAPI.ControllerConfig;
using WriteAPI.Filters;

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


        [HttpPost("folders/share")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task ToPublicEditShareFolders(ChangeRefTypeFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPost("folders/user/permission")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task ChangeUserPermissionOnFolder(PermissionUserOnPrivateFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPost("folders/user/remove")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task RemoveUserFromFolder(RemoveUserFromPrivateFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPost("folders/user/invites")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task InvitesUsersToFolder(SendInvitesToUsersFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpGet("folders/user/invites/{folderId}")]
        public async Task<List<InvitedUsersToFoldersOrNote>> GetInvitedToFolderUsers(Guid folderId)
        {
            var command = new GetUsersOnPrivateFolder { FolderId = folderId, Email = this.GetUserEmail() };
            return await this._mediator.Send(command);
        }



        [HttpPost("notes/share")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task ToPublicEditShareNotes(ChangeRefTypeNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        [HttpPost("notes/user/permission")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task ChangeUserPermissionOnNote(PermissionUserOnPrivateNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPost("notes/user/remove")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task RemoveUserFromNote(RemoveUserFromPrivateNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPost("notes/user/invites")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task InvitesUsersToNotes(SendInvitesToUsersNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpGet("notes/user/invites/{noteId}")]
        public async Task<List<InvitedUsersToFoldersOrNote>> GetInvitedToNoteUsers(Guid noteId)
        {
            var command = new GetUsersOnPrivateNote { NoteId = noteId, Email = this.GetUserEmail() };
            return await this._mediator.Send(command);
        }

    }
}