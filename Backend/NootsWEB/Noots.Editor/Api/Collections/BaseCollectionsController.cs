using Common;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent.Files;
using Common.Filters;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Noots.Editor.Commands;
using Noots.Editor.Entities;
using Noots.Editor.Queries;

namespace Noots.Editor.Api.Collections;

public class BaseCollectionsController<Y, U, I, O, FileT> : ControllerBase
    where Y : BaseRemoveFromCollectionItems
    where U : BaseAddToCollectionItems
    where I : BaseUpdateCollectionInfo
    where FileT : BaseFileNoteDTO
    where O : GetNoteFilesByIdsQuery<FileT>
{
    protected readonly IMediator _mediator;
    public BaseCollectionsController(IMediator _mediator)
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