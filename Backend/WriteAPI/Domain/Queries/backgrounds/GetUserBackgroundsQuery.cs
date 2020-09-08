using Common.DTO.backgrounds;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.backgrounds
{
    public class GetUserBackgroundsQuery : BaseQueryEntity, IRequest<List<BackgroundDTO>>
    {
        public GetUserBackgroundsQuery(string email): base(email)
        {

        }
    }
}
