using System;
using System.Collections.Generic;
using Common.DTO.History;
using MediatR;

namespace Domain.Queries.History
{
    public class GetNoteHistoriesQuery : BaseQueryEntity, IRequest<List<NoteHistoryDTO>>
    {
        public Guid NoteId { set; get; }
        public GetNoteHistoriesQuery(Guid NoteId, string Email)
        {
            this.NoteId = NoteId;
            this.Email = Email;
        }
    }
}
