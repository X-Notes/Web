using Common.DTO;
using Common.DTO.Notes.FullNoteContent.Files;
using Domain.Commands.NoteInner.FileContent;
using Domain.Queries.NoteInner;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers.FullNoteAPI
{
    public class BaseNoteFileContentController<Y, U, I, O, FileT> : ControllerBase
        where Y : BaseRemoveFromCollectionItems
        where U : BaseAddToCollectionItems
        where I : BaseUpdateCollectionInfo
        where FileT : BaseFileNoteDTO
        where O : GetNoteFilesByIdsQuery<FileT>
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

        [HttpPost("get/files")]
        public virtual async Task<List<FileT>> GetCollectionFiles(O query)
        {
            query.UserId = this.GetUserId();
            return await _mediator.Send(query);
        }
    }
}
