using System;
using MediatR;

namespace Domain.Commands.Labels
{
    public class NewLabelCommand : BaseCommandEntity, IRequest<Guid>
    {
        public NewLabelCommand(string email)
            :base(email)
        {

        }
    }
}
