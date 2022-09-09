using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.Notes.Commands
{
    public class DeleteNotesCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmpty]
        public List<Guid> Ids { set; get; }

        public DeleteNotesCommand(Guid userId) : base(userId)
        {

        }
    }
}
