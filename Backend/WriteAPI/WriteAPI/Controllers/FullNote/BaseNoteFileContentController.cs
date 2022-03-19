using Common.DTO;
using Domain.Commands.NoteInner.FileContent;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers.FullNote
{
    public class BaseNoteFileContentController<Y, U, I> : ControllerBase 
        where Y : BaseRemoveFromCollectionItems
        where U : BaseAddToCollectionItems
        where I : BaseUpdateCollectionInfo
    {
        protected readonly IMediator _mediator;
        public BaseNoteFileContentController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        [HttpPatch("info")]
        public virtual async Task<OperationResult<Unit>> UpdateCollectionInfo(I command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }

        [HttpPost("remove")]
        public virtual async Task<OperationResult<Unit>> RemoveItemsFromCollection(Y command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }

        [HttpPost("add")]
        public virtual async Task<OperationResult<Unit>> AddItemsToCollection(U command)
        {
            command.UserId = this.GetUserId();
            return await _mediator.Send(command);
        }
    }
}
