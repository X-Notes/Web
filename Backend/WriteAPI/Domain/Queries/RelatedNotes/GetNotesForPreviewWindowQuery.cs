using System;
using System.Collections.Generic;
using Common.DTO.Notes;
using MediatR;

namespace Domain.Queries.RelatedNotes
{
    public class GetNotesForPreviewWindowQuery : BaseQueryEntity, IRequest<List<PreviewNoteForSelection>>
    {
        public Guid NoteId { set; get; }
        public string Search { set; get; }
        public GetNotesForPreviewWindowQuery(string Email, Guid NoteId, string Search)
        {
            this.Email = Email;
            this.NoteId = NoteId;
            this.Search = Search;
        }
    }
}
