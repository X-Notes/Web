using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.labels
{
    public class NewLabelCommand : BaseCommandEntity, IRequest<int>
    {
        public NewLabelCommand(string email)
            :base(email)
        {

        }
    }
}
