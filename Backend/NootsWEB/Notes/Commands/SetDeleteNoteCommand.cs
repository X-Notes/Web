using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Notes.Commands
{
    public class SetDeleteNoteCommand : BaseCommandEntity, IRequest<OperationResult<List<Guid>>>
    {
        [RequiredListNotEmpty]
        public List<Guid> Ids { set; get; }

        public SetDeleteNoteCommand(Guid userId, List<Guid> ids) : base(userId)
        {
            Ids = ids;
        }
    }
}
