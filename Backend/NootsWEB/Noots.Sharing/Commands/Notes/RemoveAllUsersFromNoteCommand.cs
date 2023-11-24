using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Sharing.Commands.Notes
{
    public class RemoveAllUsersFromNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }
    }
}
