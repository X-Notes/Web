using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Queries.notes
{
    public class GetNoteContentsQuery : BaseQueryEntity, IRequest<List<BaseContentNoteDTO>>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
        public GetNoteContentsQuery(string email, Guid NoteId)
            : base(email)
        {
            this.NoteId = NoteId;
        }
    }
}
