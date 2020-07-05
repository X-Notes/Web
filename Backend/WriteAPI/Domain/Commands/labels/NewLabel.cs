using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.labels
{
    public class NewLabel : BaseCommandEntity, IRequest<int>
    {
        public string Name { set; get; }
        public string Color { set; get; }
        public NewLabel(string email)
            :base(email)
        {

        }
    }
}
