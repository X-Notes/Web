using Common.CQRS;
using MediatR;

namespace Noots.Labels.Queries
{
    public class GetCountNotesByLabelQuery : BaseQueryEntity, IRequest<int>
    {
        public Guid LabelId { set; get; }
    }
}
