using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.RGA_CRDT;

namespace Noots.Editor.Commands
{
    public class UpdateTitleNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        public MergeTransaction<string> Transaction { set; get; }

        [ValidationGuid]
        public Guid Id { set; get; }
    }
}
