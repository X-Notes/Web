using Common.CQRS;
using Common.DTO.Labels;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Queries.Labels
{
    public class GetLabelsQuery : BaseQueryEntity, IRequest<List<LabelDTO>>
    {
        public GetLabelsQuery(Guid userId)
            :base(userId)
        {
        }
    }
}
