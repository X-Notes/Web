using Common.CQRS;
using MediatR;
using Noots.Storage.Queries;
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
