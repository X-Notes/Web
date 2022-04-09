using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Notes
{
    public class CopyNoteCommand : BaseCommandEntity, IRequest<OperationResult<List<Guid>>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public CopyNoteCommand()
        {

        }

        public CopyNoteCommand(Guid userId) : base(userId)
        {

        }
    }
}
