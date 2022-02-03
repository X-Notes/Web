using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Notes
{
    public class MakePrivateNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public MakePrivateNoteCommand(string email) : base(email)
        {

        }
    }
}
