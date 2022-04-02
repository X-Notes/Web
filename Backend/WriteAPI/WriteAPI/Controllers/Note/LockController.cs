using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Domain.Commands.Encryption;
using Domain.Queries.Encryption;
using WriteAPI.ControllerConfig;
using Microsoft.AspNetCore.Authorization;
using Common.DTO;
using BI.Services.Encryption;
using System;

namespace WriteAPI.Controllers.Note
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LockController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly UserNoteEncryptStorage userNoteEncryptStorage;

        public LockController(IMediator _mediator, UserNoteEncryptStorage userNoteEncryptStorage)
        {
            this._mediator = _mediator;
            this.userNoteEncryptStorage = userNoteEncryptStorage;
        }


        [HttpPost("encrypt")]
        public async Task<OperationResult<bool>> EncryptNote(EncryptionNoteCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }

        [HttpPost("decrypt")]
        public async Task<OperationResult<bool>> DecryptNote(DecriptionNoteCommand command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }

        [HttpPost("unlock")]
        public async Task<OperationResult<bool>> UnlockNote(UnlockNoteQuery query)
        {
            query.UserId = this.GetUserId();
            return await _mediator.Send(query);
        }

        [HttpGet("force/{noteId}")]
        public OperationResult<bool> ForceLockNote(Guid noteId)
        {
            var result = userNoteEncryptStorage.RemoveUnlockTime(noteId);
            return new OperationResult<bool>(result, result);
        }
    }
}
