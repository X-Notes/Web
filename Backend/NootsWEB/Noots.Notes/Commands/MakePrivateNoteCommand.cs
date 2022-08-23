using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.Notes.Commands
{
    public class MakePrivateNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmpty]
        public List<Guid> Ids { set; get; }

        public MakePrivateNoteCommand(Guid userId) : base(userId)
        {

        }
    }
}
