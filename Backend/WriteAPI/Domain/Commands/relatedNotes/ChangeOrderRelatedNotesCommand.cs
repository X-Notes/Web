using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Commands.relatedNotes
{
    public class ChangeOrderRelatedNotesCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        public Guid? InsertAfter { set; get; }

        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }

        [ValidationGuidAttribute]
        public Guid Id { set; get; }
    }
}
