using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.Editor.Services.Interaction.Entities;

namespace Noots.Editor.Services.Interaction;

public class UpdateCursorCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
{
    [ValidationGuid]
    public Guid NoteId { set; get; }

    public Cursor Cursor { set; get; }

    public string ConnectionId { set; get; }
}
