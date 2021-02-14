using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.labels
{
    public class GetCountNotesByLabel : BaseQueryEntity, IRequest<int>
    {
        public Guid LabelId { set; get; }
    }
}
