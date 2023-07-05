using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.Notes.Entities;

namespace Noots.Notes.Commands
{
    public class CopyNotesCommand : BaseCommandEntity, IRequest<OperationResult<List<CopyNoteResult>>>
    {
        [RequiredListNotEmpty]
        public List<Guid> Ids { set; get; }

        public Guid? FolderId { set; get; }


        public CopyNotesCommand(Guid userId) : base(userId)
        {

        }
    }
}
