using System;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;

namespace Domain.Commands.RelatedNotes
{
    public class UpdateRelatedNoteStateCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid RelatedNoteId { set; get; }

        public bool IsOpened { set; get; }
    }
}
