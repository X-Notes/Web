using Domain.Queries.Files;
using MediatR;
using System;

namespace Domain.Queries.Users
{
    public class GetUserMemoryQuery : BaseQueryEntity, IRequest<GetUserMemoryResponse>
    {
        public GetUserMemoryQuery(Guid userId) : base(userId)
        {

        }
    }
}
