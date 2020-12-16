using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.notes
{
    public class GetFullNoteQuery: BaseQueryEntity, IRequest<FullNoteAnswer>
    {
        public Guid Id { set; get; }
        public GetFullNoteQuery(string email, Guid id)
            :base(email)
        {
            this.Id = id;
        }
    }
}
