using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;

namespace Notes.Commands;

public class NewPrivateNoteCommand: BaseCommandEntity, IRequest<OperationResult<SmallNote>>
{
    public NewPrivateNoteCommand(Guid userId)
        :base(userId)
    {

    }
}