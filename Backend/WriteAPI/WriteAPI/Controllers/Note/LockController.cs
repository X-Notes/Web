using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Domain.Commands.Encryption;
using Domain.Queries.Encryption;
using WriteAPI.ControllerConfig;
using Microsoft.AspNetCore.Authorization;
using Common.DTO;

namespace WriteAPI.Controllers.Note
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
            return await _mediator.Send(command);
        }

        [HttpPost("decrypt")]
        public async Task<OperationResult<bool>> DecryptNote(DecriptionNoteCommand command)
        {
            command.Email = this.GetUserEmail();
            return await _mediator.Send(command);
        }

        [HttpPost("unlock")]
        public async Task<OperationResult<bool>> UnlockNote(UnlockNoteQuery query)
        {
            query.Email = this.GetUserEmail();
            return await _mediator.Send(query);
        }

    }
}
