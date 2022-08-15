using System;
using Common.CQRS;
using MediatR;

namespace Domain.Queries.Labels
{
    public class GetCountNotesByLabelQuery : BaseQueryEntity, IRequest<int>
    {
        public Guid LabelId { set; get; }
    }
}
