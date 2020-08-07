using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.notes
{
    public class GetArchiveNotesQuery : BaseQueryEntity, IRequest<List<SmallNote>> 
    {
        public GetArchiveNotesQuery(string email): base(email)
        {

        }
    }
}
