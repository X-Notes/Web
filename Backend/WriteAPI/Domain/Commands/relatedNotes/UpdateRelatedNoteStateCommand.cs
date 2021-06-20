using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;

namespace Domain.Commands.relatedNotes
{
    public class UpdateRelatedNoteStateCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }

        [ValidationGuidAttribute]
        public Guid RelatedNoteId { set; get; }

        public bool IsOpened { set; get; }
    }
}
