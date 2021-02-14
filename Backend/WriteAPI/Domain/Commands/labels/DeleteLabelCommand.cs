using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.labels
{
    public class SetDeleteLabelCommand : BaseCommandEntity, IRequest<Unit>
    {
        public Guid Id { set; get; }
        public SetDeleteLabelCommand(string email, Guid id)
            :base(email)
        {
            this.Id = id;
        }
    }
}
