using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Queries.relatedNotes
{
    public class GetNotesForPreviewWindowQuery : BaseQueryEntity, IRequest<List<PreviewRelatedNote>>
    {
        public GetNotesForPreviewWindowQuery(string Email)
        {
            this.Email = Email;
        }
    }
}
