using Common.DTO.Labels;
using MediatR;
using System;

namespace Domain.Queries.Labels
{
    public class GetLabelsByEmailQuery : BaseQueryEntity, IRequest<LabelsDTO>
    {
        public GetLabelsByEmailQuery(Guid userId)
            :base(userId)
        {
        }
    }
}
