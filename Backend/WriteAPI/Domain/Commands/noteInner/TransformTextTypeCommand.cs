using Common.Attributes;
using Common.DatabaseModels.models.NoteContent.ContentParts;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.noteInner
{
    public class TransformTextTypeCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }

        [ValidationGuidAttribute]
        public Guid ContentId { set; get; }

        [Required]
        public NoteTextTypeENUM Type { set; get; }

        public HTypeENUM? HeadingType { set; get; }
    }
}
