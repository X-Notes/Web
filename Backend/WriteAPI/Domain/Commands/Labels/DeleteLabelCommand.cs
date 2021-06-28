using System;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Labels
{
    public class SetDeleteLabelCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }
        public SetDeleteLabelCommand(string email, Guid id)
            :base(email)
        {
            this.Id = id;
        }
    }
}
