using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.RelatedNotes.Commands
{
    public class UpdateRelatedNoteStateCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [Range(1, int.MaxValue)]
        public int ReletatedNoteInnerNoteId { set; get; }

        public bool IsOpened { set; get; }
    }
}
