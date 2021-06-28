using MediatR;

namespace Domain.Commands.Labels
{
    public class RemoveAllFromBinCommand : BaseCommandEntity, IRequest<Unit>
    {
        public RemoveAllFromBinCommand(string email): base(email)
        {
        }
    }
}
