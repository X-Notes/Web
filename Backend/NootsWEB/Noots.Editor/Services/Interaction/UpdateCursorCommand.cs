using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Editor.Services.Interaction.Entities;
using MediatR;

namespace Editor.Services.Interaction;

public class UpdateCursorCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
{
    [ValidationGuid]
    public Guid NoteId { set; get; }

    public Cursor Cursor { set; get; }

    public string ConnectionId { set; get; }
}
