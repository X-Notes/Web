using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Sharing.Commands.Notes
{
    public class RemoveUserFromPrivateNotes : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid PermissionUserId { set; get; }
    }
}
