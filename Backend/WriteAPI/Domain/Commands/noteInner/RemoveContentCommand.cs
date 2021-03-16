using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;

namespace Domain.Commands.noteInner
{
    public class RemoveContentCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
        [ValidationGuidAttribute]
        public Guid ContentId { set; get; }
    }
}
