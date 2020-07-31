using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.notes
{
    public class GetSharedNotesQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        public GetSharedNotesQuery(string email) : base(email)
        {

        }
    }
}
