using System;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Labels
{
    public class SetDeletedLabelCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }
        public SetDeletedLabelCommand(Guid userId, Guid id)
            : base(userId)
        {
            this.Id = id;
        }
    }
}
