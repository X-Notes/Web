using BI.Services.Notes.Interaction.Entities;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;
using System;

namespace BI.Services.Notes.Interaction;

public class UpdateCursorCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
{
    [ValidationGuid]
    public Guid NoteId { set; get; }

    public Cursor Cursor { set; get; }
}
