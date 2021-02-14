using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.labels
{
    public class NewLabelCommand : BaseCommandEntity, IRequest<Guid>
    {
        public NewLabelCommand(string email)
            :base(email)
        {

        }
    }
}
