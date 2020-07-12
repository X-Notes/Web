using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.notes
{
    public class GetFullNoteQuery: BaseQueryEntity, IRequest<FullNote>
    {
        public int Id { set; get; }
        public GetFullNoteQuery(string email, int id)
            :base(email)
        {
            this.Id = id;
        }
    }
}
