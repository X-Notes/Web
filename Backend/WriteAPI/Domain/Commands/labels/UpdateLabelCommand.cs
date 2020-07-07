using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.labels
{
    public class UpdateLabelCommand : BaseCommandEntity, IRequest<Unit>
    {
        public int Id { set; get; }
        public string Name { set; get; }
        public string Color { set; get; }
        public UpdateLabelCommand(string email)
            :base(email)
        {

        }
    }
}
