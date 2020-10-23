﻿using Common.DatabaseModels.helpers;
using Domain.Commands.share.folders;
using Domain.Commands.share.notes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WriteAPI.ControllerConfig;

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
        public async Task ToPublicEditShareFolders(ChangeRefTypeFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPost("folders/user/permission")]
        public async Task ChangeUserPermissionOnFolder(PermissionUserOnPrivateFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPost("folders/user/remove")]
        public async Task RemoveUserFromFolder(RemoveUserFromPrivateFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPost("folders/user/invites")]
        public async Task InvitesUsersToFolder(SendInvitesToUsersFolders command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }



        [HttpPost("notes/share")]
        public async Task ToPublicEditShareNotes(ChangeRefTypeNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }


        [HttpPost("notes/user/permission")]
        public async Task ChangeUserPermissionOnNote(PermissionUserOnPrivateNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPost("notes/user/remove")]
        public async Task RemoveUserFromNote(RemoveUserFromPrivateNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

        [HttpPost("notes/user/invites")]
        public async Task InvitesUsersToNotes(SendInvitesToUsersNotes command)
        {
            var email = this.GetUserEmail();
            command.Email = email;
            await this._mediator.Send(command);
        }

    }
}