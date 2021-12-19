using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Notes
{
    public class SetDeleteNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public SetDeleteNoteCommand(string email, List<Guid> ids) : base(email)
        {
            Ids = ids;
        }
    }
}
