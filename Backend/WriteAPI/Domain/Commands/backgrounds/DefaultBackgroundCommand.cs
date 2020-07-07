using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.backgrounds
{
    public class DefaultBackgroundCommand : BaseCommandEntity, IRequest<Unit>
    {
        public DefaultBackgroundCommand(string email)
            :base(email)
        {

        }
    }
}
