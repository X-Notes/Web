using System;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;

namespace Domain.Commands.NoteInner
{
    public class RemoveContentCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }
        [ValidationGuid]
        public Guid ContentId { set; get; }
    }
}
