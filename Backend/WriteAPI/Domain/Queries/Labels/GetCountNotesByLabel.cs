using System;
using MediatR;

namespace Domain.Queries.Labels
{
    public class GetCountNotesByLabel : BaseQueryEntity, IRequest<int>
    {
        public Guid LabelId { set; get; }
    }
}
