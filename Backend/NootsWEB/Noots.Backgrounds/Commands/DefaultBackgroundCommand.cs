using Common.CQRS;
using MediatR;

namespace Noots.Backgrounds.Commands
{
    public class DefaultBackgroundCommand : BaseCommandEntity, IRequest<Unit>
    {
        public DefaultBackgroundCommand(Guid userId)
            :base(userId)
        {

        }
    }
}
