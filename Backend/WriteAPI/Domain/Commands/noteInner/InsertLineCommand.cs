using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.noteInner
{
    public class InsertLineCommand : BaseCommandEntity, IRequest<TextOperationResult<TextNoteDTO>>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
        [ValidationGuidAttribute]
        public Guid ContentId { set; get; }
        [Required]
        public string LineBreakType { set; get; }
        public string NextText { set; get; }
    }
}
