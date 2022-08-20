using Common.Attributes;
using Common.CQRS;
using MediatR;

namespace Noots.Backgrounds.Commands
{
    public class UpdateBackgroundCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }

        public UpdateBackgroundCommand(Guid userId, Guid id)
            :base(userId)
        {
            this.Id = id;
        }
    }
}
