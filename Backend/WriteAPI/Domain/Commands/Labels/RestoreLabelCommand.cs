using System;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Labels
{
    public class RestoreLabelCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }
        public RestoreLabelCommand(string email, Guid id)
            : base(email)
        {
            this.Id = id;
        }
    }
}
