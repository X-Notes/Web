using Common.Attributes;
using Common.DatabaseModels.models.NoteContent;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;


namespace Domain.Commands.noteInner
{
    public class NewLineTextContentNoteCommand : BaseCommandEntity, IRequest<OperationResult<TextNoteDTO>>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
    }
}
