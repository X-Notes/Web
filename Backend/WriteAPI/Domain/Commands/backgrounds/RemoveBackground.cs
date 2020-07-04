using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.backgrounds
{
    public class RemoveBackground : BaseCommandEntity, IRequest<Unit>
    {
        public int Id { set; get; }
        public RemoveBackground(string email, int id)
            :base(email)
        {
            this.Id = id;
        }
    }
}
