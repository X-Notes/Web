using Common.Attributes;
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
        public string Type { set; get; }
        public string HeadingType { set; get; }
    }
}
