using Common.Attributes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.backgrounds
{
    public class RemoveBackgroundCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }
        public RemoveBackgroundCommand(string email, Guid id)
            :base(email)
        {
            this.Id = id;
        }
    }
}
