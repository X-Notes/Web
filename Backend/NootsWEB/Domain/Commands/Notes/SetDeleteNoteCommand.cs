using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Notes
{
    public class SetDeleteNoteCommand : BaseCommandEntity, IRequest<OperationResult<List<Guid>>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public SetDeleteNoteCommand(Guid userId, List<Guid> ids) : base(userId)
        {
            Ids = ids;
        }
    }
}
