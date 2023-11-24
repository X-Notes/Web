using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Folders.Commands.FolderInner;

public class AddNotesToFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
{
    [ValidationGuid]
    public Guid FolderId { set; get; }

    public List<Guid> NoteIds { set; get; }

    public string ConnectionId { set; get; }
}
