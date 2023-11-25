using Common.CQRS;
using Common.DTO;
using MediatR;
using Users.Entities;

namespace Users.Queries
{
    public class GetUserDTOQuery : BaseQueryEntity, IRequest<OperationResult<UserDTO>>
    {
        public GetUserDTOQuery(Guid userId) :base(userId)
        {
        }
    }
}
