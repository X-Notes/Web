using System;
using System.Collections.Generic;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Notes
{
    public class MakePrivateNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public MakePrivateNoteCommand(string email) : base(email)
        {

        }
    }
}
