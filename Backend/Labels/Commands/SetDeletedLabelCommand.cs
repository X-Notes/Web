using Common.Attributes;
using Common.CQRS;
using MediatR;

namespace Labels.Commands
{
    public class SetDeletedLabelCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }

        public SetDeletedLabelCommand(Guid userId, Guid id)
            : base(userId)
        {
            this.Id = id;
        }
    }
}
