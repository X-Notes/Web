using Common.CQRS;
using MediatR;

namespace Labels.Queries
{
    public class GetCountNotesByLabelQuery : BaseQueryEntity, IRequest<int>
    {
        public Guid LabelId { set; get; }
    }
}
