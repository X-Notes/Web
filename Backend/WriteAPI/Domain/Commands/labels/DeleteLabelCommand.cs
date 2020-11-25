using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.labels
{
    public class SetDeleteLabelCommand : BaseCommandEntity, IRequest<Unit>
    {
        public int Id { set; get; }
        public SetDeleteLabelCommand(string email, int id)
            :base(email)
        {
            this.Id = id;
        }
    }
}
