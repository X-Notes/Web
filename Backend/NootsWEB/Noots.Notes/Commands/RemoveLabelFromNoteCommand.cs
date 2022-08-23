using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.Notes.Commands
{
    public class RemoveLabelFromNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid LabelId { set; get; }
        
        [RequiredListNotEmpty]
        public List<Guid> NoteIds { set; get; }
    }
}
