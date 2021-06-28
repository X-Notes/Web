using System;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.NoteInner
{
    public class UpdateTextNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public string Content { set; get; }

        public bool? Checked { set; get; }

        public bool? IsBold { set; get; }

        public bool? IsItalic { set; get; }
    }
}
