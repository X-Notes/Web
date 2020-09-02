using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.notes
{
    public class AddLabelOnNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        public int LabelId { set; get; }
        public List<string> NoteIds { set; get; }
    }
}
