using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.backgrounds
{
    public class RemoveBackgroundCommand : BaseCommandEntity, IRequest<Unit>
    {
        public int Id { set; get; }
        public RemoveBackgroundCommand(string email, int id)
            :base(email)
        {
            this.Id = id;
        }
    }
}
