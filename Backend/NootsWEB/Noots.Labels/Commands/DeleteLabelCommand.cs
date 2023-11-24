using Common.Attributes;
using Common.CQRS;
using MediatR;

namespace Labels.Commands
{
    public class DeleteLabelCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }

        public DeleteLabelCommand(Guid userId, Guid id)
            :base(userId)
        {
            this.Id = id;
        }
    }
}
