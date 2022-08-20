using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.WebSockets.ReletedNotes;
using MediatR;

namespace Noots.RelatedNotes.Commands
{
    public class UpdateRelatedNotesToNoteCommand : BaseCommandEntity, IRequest<OperationResult<UpdateRelatedNotesWS>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }
        
        public List<Guid> RelatedNoteIds { set; get; }
    }
}
