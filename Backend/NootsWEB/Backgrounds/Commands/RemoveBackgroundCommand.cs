using Common.Attributes;
using Common.CQRS;
using MediatR;

namespace Backgrounds.Commands
{
    public class RemoveBackgroundCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }

        public RemoveBackgroundCommand(Guid userId, Guid id)
            :base(userId)
        {
            this.Id = id;
        }
    }
}
