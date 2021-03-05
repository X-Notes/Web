using Common.Attributes;
using MediatR;
using System;

namespace Domain.Commands.noteInner
{
    public class UpdateTextNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
        [ValidationGuidAttribute]
        public Guid ContentId { set; get; }
        public string Content { set; get; }
    }
}
