using Common.DTO.history;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Queries.history
{
    public class GetNoteHistories : BaseQueryEntity, IRequest<List<NoteHistoryDTO>>
    {
        public Guid NoteId { set; get; }
        public GetNoteHistories(Guid NoteId, string Email)
        {
            this.NoteId = NoteId;
            this.Email = Email;
        }
    }
}
