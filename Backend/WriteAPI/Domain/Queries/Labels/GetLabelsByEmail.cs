using Common.DTO.Labels;
using MediatR;

namespace Domain.Queries.Labels
{
    public class GetLabelsByEmail : BaseQueryEntity, IRequest<LabelsDTO>
    {
        public GetLabelsByEmail(string Email)
            :base(Email)
        {
        }
    }
}
