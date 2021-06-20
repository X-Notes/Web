using Common.Attributes;
using Common.DatabaseModels.models.NoteContent.ContentParts;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.noteInner
{
    public class InsertLineCommand : BaseCommandEntity, IRequest<OperationResult<TextNoteDTO>>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }

        [ValidationGuidAttribute]
        public Guid ContentId { set; get; }

        [Required]
        public string LineBreakType { set; get; }

        public string NextText { set; get; }

        [RequiredEnumField(ErrorMessage = "NoteTextType is required.")]
        public NoteTextTypeENUM NoteTextType { set; get; }
    }
}
