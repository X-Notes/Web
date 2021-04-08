using Common.Attributes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Commands.relatedNotes
{
    public class UpdateRelatedNoteStateCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
        [ValidationGuidAttribute]
        public Guid RelatedNoteId { set; get; }
        public bool IsOpened { set; get; }
    }
}
