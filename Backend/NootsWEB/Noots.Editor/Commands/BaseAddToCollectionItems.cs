using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.Editor.Entities;

namespace Noots.Editor.Commands;

public class BaseAddToCollectionItems : BaseCommandEntity, IRequest<OperationResult<UpdateCollectionContentResult>>
{
    [ValidationGuid]
    public Guid NoteId { set; get; }

    [ValidationGuid]
    public Guid ContentId { set; get; }

    [ValidationGuid]
    public List<Guid> FileIds { set; get; }

    public BaseAddToCollectionItems(Guid noteId, Guid contentId, List<Guid> fileIds)
    {
        NoteId = noteId;
        ContentId = contentId;
        FileIds = fileIds;
    }
}
