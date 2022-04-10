using Common.DTO;
using Common.DTO.Users;
using MediatR;
using System;

namespace Domain.Queries.Users
{
    public class GetUserQuery : BaseQueryEntity, IRequest<OperationResult<UserDTO>>
    {
        public GetUserQuery(Guid userId) :base(userId)
        {
        }
    }
}
