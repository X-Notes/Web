using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.Users.Entities;
using System;

namespace Domain.Queries.Users
{
    public class GetShortUserQuery : BaseQueryEntity, IRequest<OperationResult<ShortUser>>
    {
        public GetShortUserQuery(Guid userId) :base(userId)
        {
        }
    }
}
