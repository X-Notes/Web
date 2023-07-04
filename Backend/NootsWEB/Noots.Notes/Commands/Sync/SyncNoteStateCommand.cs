using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.Notes.Entities;

namespace Noots.Notes.Commands.Sync;

public class SyncNoteStateCommand : BaseCommandEntity, IRequest<OperationResult<SyncNoteResult>>
{
    [ValidationGuid]
    public Guid NoteId { set; get; }

    public Guid? FolderId { set; get; }

    public int Version { set; get; }
}
