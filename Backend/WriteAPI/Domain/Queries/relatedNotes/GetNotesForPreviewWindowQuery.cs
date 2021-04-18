using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Queries.relatedNotes
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
