using Common.Attributes;
using Common.CQRS;
using MediatR;

namespace Noots.Labels.Commands
{
    public class RestoreLabelCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }

        public RestoreLabelCommand(Guid userId, Guid id)
            : base(userId)
        {
            this.Id = id;
        }
    }
}
