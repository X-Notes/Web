using MediatR;

namespace Noots.Storage.Commands
{
    public class CreateUserContainerCommand : IRequest<Unit>
    {
        public Guid UserId { set; get; }

        public CreateUserContainerCommand(Guid userId)
        {
            UserId = userId;
        }
    }
}
