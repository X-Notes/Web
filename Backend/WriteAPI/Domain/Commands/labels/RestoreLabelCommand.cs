using Common.Attributes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.labels
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
