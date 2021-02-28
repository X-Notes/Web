using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.notes
{
    public class RemoveLabelFromNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public Guid LabelId { set; get; }
        [Required]
        public List<Guid> NoteIds { set; get; }
    }
}
