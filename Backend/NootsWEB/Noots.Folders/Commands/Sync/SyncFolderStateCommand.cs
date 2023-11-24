using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Folders.Entities;
using MediatR;

namespace Folders.Commands.Sync;

public class SyncFolderStateCommand : BaseCommandEntity, IRequest<OperationResult<SyncFolderResult>>
{
    [ValidationGuid]
    public Guid FolderId { set; get; }

    public int Version { set; get; }

    public List<Guid>? NoteIds { set; get; }
}
