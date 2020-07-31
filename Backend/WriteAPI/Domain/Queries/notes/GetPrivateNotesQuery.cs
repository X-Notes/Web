using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.notes
{
    public class GetPrivateNotesQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        public GetPrivateNotesQuery(string email)
            :base(email)
        {

        }
    }
}
