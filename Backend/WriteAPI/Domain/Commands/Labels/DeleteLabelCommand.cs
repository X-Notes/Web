using System;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Labels
{
    public class DeleteLabelCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }
        public DeleteLabelCommand(string email, Guid id)
            :base(email)
        {
            this.Id = id;
        }
    }
}
