using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Notes
{
    public class AddLabelOnNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid LabelId { set; get; }
        [Required]
        public List<Guid> NoteIds { set; get; }
    }
}
