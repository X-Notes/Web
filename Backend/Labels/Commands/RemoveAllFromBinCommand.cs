﻿using Common.CQRS;
using MediatR;

namespace Labels.Commands
{
    public class RemoveAllFromBinCommand : BaseCommandEntity, IRequest<Unit>
    {
        public RemoveAllFromBinCommand(Guid userId) : base(userId)
        {
        }
    }
}
