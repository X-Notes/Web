using System;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Backgrounds
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
