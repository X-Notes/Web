using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Notes.Commands
{
    public class RemoveLabelFromNoteCommand : BaseCommandEntity, IRequest<OperationResult<List<VersionUpdateResult>>>
    {
        [ValidationGuid]
        public Guid LabelId { set; get; }
        
        [RequiredListNotEmpty]
        public List<Guid> NoteIds { set; get; }

        public string ConnectionId { set; get; }
    }
}
