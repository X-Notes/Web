using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.backgrounds
{
    public class DefaultBackground : BaseCommandEntity, IRequest<Unit>
    {
        public DefaultBackground(string email)
            :base(email)
        {

        }
    }
}
