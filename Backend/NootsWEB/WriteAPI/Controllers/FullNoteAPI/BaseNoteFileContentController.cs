using Common.DTO;
using Common.DTO.Notes.FullNoteContent.Files;
using Domain.Commands.NoteInner.FileContent;
using Domain.Commands.NoteInner.FileContent.Texts.Entities;
using Domain.Queries.NoteInner;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using WriteAPI.ControllerConfig;
using WriteAPI.Filters;

namespace WriteAPI.Controllers.FullNoteAPI;

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
    [ValidationRequireUserIdFilter]
    public virtual async Task<OperationResult<UpdateBaseContentResult>> UpdateCollectionInfo(I command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("remove")]
    [ValidationRequireUserIdFilter]
    public virtual async Task<OperationResult<UpdateCollectionContentResult>> RemoveItemsFromCollection(Y command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("add")]
    [ValidationRequireUserIdFilter]
    public virtual async Task<OperationResult<UpdateCollectionContentResult>> AddItemsToCollection(U command)
    {
        command.UserId = this.GetUserId();
        return await _mediator.Send(command);
    }

    [HttpPost("get/files")]
    [ValidationRequireUserIdFilter]
    public virtual async Task<List<FileT>> GetCollectionFiles(O query)
    {
        query.UserId = this.GetUserId();
        return await _mediator.Send(query);
    }
}