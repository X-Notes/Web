using Common.CQRS;
using Common.DTO;
using Common.DTO.Users;
using MediatR;
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
