using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;

namespace Domain.Commands.RelatedNotes
{
    public class ChangeOrderRelatedNotesCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmptyAttribute]
        public List<EntityPositionDTO> Positions { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }
    }
}
