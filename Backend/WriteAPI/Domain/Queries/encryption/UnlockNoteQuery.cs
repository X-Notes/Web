using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Queries.encryption
{
    public class UnlockNoteQuery : BaseQueryEntity, IRequest<OperationResult<bool>>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
        [ValidationGuidAttribute]
        public string Password { set; get; }
    }
}
