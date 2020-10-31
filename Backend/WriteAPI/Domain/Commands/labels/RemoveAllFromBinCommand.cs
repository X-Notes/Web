using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.labels
{
    public class RemoveAllFromBinCommand : BaseCommandEntity, IRequest<Unit>
    {
        public RemoveAllFromBinCommand(string email): base(email)
        {
        }
    }
}
