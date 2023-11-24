using Common.CQRS;
using Common.DTO.Labels;
using MediatR;

namespace Labels.Queries
{
    public class GetLabelsQuery : BaseQueryEntity, IRequest<List<LabelDTO>>
    {
        public GetLabelsQuery(Guid userId)
            :base(userId)
        {
        }
    }
}
