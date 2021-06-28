using MediatR;

namespace Domain.Commands.Backgrounds
{
    public class DefaultBackgroundCommand : BaseCommandEntity, IRequest<Unit>
    {
        public DefaultBackgroundCommand(string email)
            :base(email)
        {

        }
    }
}
