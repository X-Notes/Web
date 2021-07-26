using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.Encryption;
using Domain.Queries.Encryption;
using WriteAPI.ControllerConfig;
using Microsoft.AspNetCore.Authorization;

namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LockController : ControllerBase
    {
        private readonly IMediator _mediator;
        public LockController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }


        [HttpPost("encrypt")]
        public async Task<OperationResult<bool>> EncryptNote(EncryptionNoteCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPost("decrypt")]
        public async Task<OperationResult<bool>> DecryptNote(DecriptionNoteCommand command)
        {
            command.Email = this.GetUserEmail();
            return await this._mediator.Send(command);
        }

        [HttpPost("unlock")]
        public async Task<OperationResult<bool>> UnlockNote(UnlockNoteQuery query)
        {
            query.Email = this.GetUserEmail();
            return await this._mediator.Send(query);
        }

    }
}
