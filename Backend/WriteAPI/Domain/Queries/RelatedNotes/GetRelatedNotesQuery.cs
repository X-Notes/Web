using System;
using System.Collections.Generic;
using Common.DTO.Notes;
using MediatR;

namespace Domain.Queries.RelatedNotes
{
    public class GetRelatedNotesQuery : BaseQueryEntity, IRequest<List<RelatedNote>>
    {
        public Guid NoteId { set; get; }
        public GetRelatedNotesQuery(string email, Guid id)
            : base(email)
        {
            this.NoteId = id;
        }
    }
}
