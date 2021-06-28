using System.Collections.Generic;
using Common.DTO.Backgrounds;
using MediatR;

namespace Domain.Queries.Backgrounds
{
    public class GetUserBackgroundsQuery : BaseQueryEntity, IRequest<List<BackgroundDTO>>
    {
        public GetUserBackgroundsQuery(string email): base(email)
        {

        }
    }
}
