using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Labels.Commands
{
    public class NewLabelCommand : BaseCommandEntity, IRequest<OperationResult<Guid>>
    {
        public NewLabelCommand(Guid userId)
            :base(userId)
        {

        }
    }
}
