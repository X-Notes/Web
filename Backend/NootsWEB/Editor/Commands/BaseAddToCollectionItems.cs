using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Editor.Entities;
using MediatR;

namespace Editor.Commands;

public class BaseAddToCollectionItems : BaseCommandEntity, IRequest<OperationResult<UpdateCollectionContentResult>>
{
    [ValidationGuid]
    public Guid NoteId { set; get; }

    [ValidationGuid]
    public Guid ContentId { set; get; }

    [ValidationGuid]
    public List<Guid> FileIds { set; get; }

    public string ConnectionId { set; get; }

    public BaseAddToCollectionItems(Guid noteId, Guid contentId, List<Guid> fileIds, string connectionId)
    {
        NoteId = noteId;
        ContentId = contentId;
        FileIds = fileIds;
        ConnectionId = connectionId;
    }
}
