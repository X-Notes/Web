using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Notes
{
    public class RemoveLabelFromNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid LabelId { set; get; }
        
        [RequiredListNotEmptyAttribute]
        public List<Guid> NoteIds { set; get; }
    }
}
