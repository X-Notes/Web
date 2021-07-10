using System;
using Common.Attributes;
using Common.DatabaseModels.Models.NoteContent.ContentParts;
using Common.DTO.Notes.FullNoteContent;
using MediatR;

namespace Domain.Commands.NoteInner
{
    public class TransformTextTypeCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        [RequiredEnumField(ErrorMessage = "NoteTextType is required.")]
        public NoteTextTypeENUM Type { set; get; }

        public HTypeENUM? HeadingType { set; get; }
    }
}
