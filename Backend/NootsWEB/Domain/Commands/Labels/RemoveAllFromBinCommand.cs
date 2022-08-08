using MediatR;
using System;

namespace Domain.Commands.Labels
{
    public class RemoveAllFromBinCommand : BaseCommandEntity, IRequest<Unit>
    {
        public RemoveAllFromBinCommand(Guid userId) : base(userId)
        {
        }
    }
}
