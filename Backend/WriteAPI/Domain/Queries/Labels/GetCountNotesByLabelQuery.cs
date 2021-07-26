using System;
using MediatR;

namespace Domain.Queries.Labels
{
    public class GetCountNotesByLabelQuery : BaseQueryEntity, IRequest<int>
    {
        public Guid LabelId { set; get; }
    }
}
