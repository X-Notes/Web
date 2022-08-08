using MediatR;
using System;

namespace Domain.Commands.Backgrounds
{
    public class DefaultBackgroundCommand : BaseCommandEntity, IRequest<Unit>
    {
        public DefaultBackgroundCommand(Guid userId)
            :base(userId)
        {

        }
    }
}
