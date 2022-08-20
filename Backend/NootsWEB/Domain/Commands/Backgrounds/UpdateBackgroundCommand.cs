using System;
using Common.Attributes;
using Common.CQRS;
using MediatR;

namespace Domain.Commands.Backgrounds
{
    public class UpdateBackgroundCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }

        public UpdateBackgroundCommand(Guid userId, Guid id)
            :base(userId)
        {
            this.Id = id;
        }
    }
}
