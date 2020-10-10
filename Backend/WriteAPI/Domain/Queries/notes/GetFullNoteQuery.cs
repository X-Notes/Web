using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.notes
{
    public class GetFullNoteQuery: BaseQueryEntity, IRequest<FullNoteAnswer>
    {
        public string Id { set; get; }
        public GetFullNoteQuery(string email, string id)
            :base(email)
        {
            this.Id = id;
        }
    }
}
