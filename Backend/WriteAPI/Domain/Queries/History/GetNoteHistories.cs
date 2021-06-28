using System;
using System.Collections.Generic;
using Common.DTO.History;
using MediatR;

namespace Domain.Queries.History
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
