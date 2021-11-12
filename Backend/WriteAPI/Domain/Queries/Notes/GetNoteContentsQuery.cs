using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;

namespace Domain.Queries.Notes
{
    public class GetNoteContentsQuery : BaseQueryEntity, IRequest<List<BaseNoteContentDTO>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }
        public GetNoteContentsQuery(string email, Guid NoteId)
            : base(email)
        {
            this.NoteId = NoteId;
        }
    }
}
