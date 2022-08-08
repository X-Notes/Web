using MediatR;
using System;

namespace Domain.Commands.Files
{
    public class CreateUserContainerCommand : IRequest<Unit>
    {
        public Guid UserId { set; get; }

        public CreateUserContainerCommand(Guid userId)
        {
            this.UserId = userId;
        }
    }
}
