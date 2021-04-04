using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Queries.relatedNotes
{
    public class GetRelatedNotesQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        public Guid NoteId { set; get; }
        public GetRelatedNotesQuery(string email, Guid id)
            : base(email)
        {
            this.NoteId = id;
        }
    }
}
