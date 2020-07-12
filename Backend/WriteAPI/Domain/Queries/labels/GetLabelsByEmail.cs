using Common.DTO.labels;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.labels
{
    public class GetLabelsByEmail : BaseQueryEntity, IRequest<List<LabelDTO>>
    {
        public GetLabelsByEmail(string Email)
            :base(Email)
        {
        }
    }
}
