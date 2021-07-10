using System;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;

namespace Domain.Commands.RelatedNotes
{
    public class ChangeOrderRelatedNotesCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        public Guid? InsertAfter { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid Id { set; get; }
    }
}
