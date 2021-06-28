using System;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Backgrounds
{
    public class UpdateBackgroundCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }
        public UpdateBackgroundCommand(string email, Guid id)
            :base(email)
        {
            this.Id = id;
        }
    }
}
