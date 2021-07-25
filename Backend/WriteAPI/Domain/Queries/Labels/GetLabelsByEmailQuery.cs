using Common.DTO.Labels;
using MediatR;

namespace Domain.Queries.Labels
{
    public class GetLabelsByEmailQuery : BaseQueryEntity, IRequest<LabelsDTO>
    {
        public GetLabelsByEmailQuery(string Email)
            :base(Email)
        {
        }
    }
}
