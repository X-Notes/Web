using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.Users.Entities;

namespace Domain.Queries.Users
{
    public class GetUserDTOQuery : BaseQueryEntity, IRequest<OperationResult<UserDTO>>
    {
        public GetUserDTOQuery(Guid userId) :base(userId)
        {
        }
    }
}
