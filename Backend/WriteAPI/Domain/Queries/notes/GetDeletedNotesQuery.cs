using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.notes
{
    public class GetDeletedNotesQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        public GetDeletedNotesQuery(string email): base(email)
        {

        }
    }
}
