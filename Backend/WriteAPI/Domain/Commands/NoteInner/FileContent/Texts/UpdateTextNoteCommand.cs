using System;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.NoteInner.FileContent.Texts
{
    public class UpdateTextNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
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
