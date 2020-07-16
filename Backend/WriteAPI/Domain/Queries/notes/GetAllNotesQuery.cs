using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.notes
{
    public class GetAllNotesQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        public GetAllNotesQuery(string email)
            :base(email)
        {

        }
    }
}
