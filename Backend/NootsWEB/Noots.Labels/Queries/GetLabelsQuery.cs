using Common.CQRS;
using Common.DTO.Labels;
using MediatR;

namespace Noots.Labels.Queries
{
    public class GetLabelsQuery : BaseQueryEntity, IRequest<List<LabelDTO>>
    {
        public GetLabelsQuery(Guid userId)
            :base(userId)
        {
        }
    }
}
