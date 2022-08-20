using Common.CQRS;
using MediatR;

namespace Noots.Labels.Commands
{
    public class NewLabelCommand : BaseCommandEntity, IRequest<Guid>
    {
        public NewLabelCommand(Guid userId)
            :base(userId)
        {

        }
    }
}
