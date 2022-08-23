using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.Labels.Commands
{
    public class NewLabelCommand : BaseCommandEntity, IRequest<OperationResult<Guid>>
    {
        public NewLabelCommand(Guid userId)
            :base(userId)
        {

        }
    }
}
