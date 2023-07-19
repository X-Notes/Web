using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;

namespace Noots.RelatedNotes.Commands
{
    public class ChangeOrderRelatedNotesCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmpty]
        public List<EntityPositionDTO> Positions { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }

        public string ConnectionId { set; get; }
    }
}
