using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO;
using Common.DTO.WebSockets.ReletedNotes;
using MediatR;

namespace Domain.Commands.RelatedNotes
{
    public class UpdateRelatedNotesToNoteCommand : BaseCommandEntity, IRequest<OperationResult<UpdateRelatedNotesWS>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }
        
        public List<Guid> RelatedNoteIds { set; get; }
    }
}
